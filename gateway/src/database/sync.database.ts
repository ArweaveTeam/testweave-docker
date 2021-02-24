import ProgressBar from 'progress';
import {DataItemJson} from 'arweave-bundles';
import {existsSync, readFileSync, writeFileSync, createWriteStream} from 'fs';
import {config} from 'dotenv';
import {log} from '../utility/log.utility';
import {ansBundles} from '../utility/ans.utility';
import {mkdir} from '../utility/file.utility';
import {sleep} from '../utility/sleep.utility';
import {getNodeInfo} from '../query/node.query';
import {block} from '../query/block.query';
import {transaction, tagValue, Tag} from '../query/transaction.query';
import {getData} from '../query/node.query';
import {importBlocks, importTransactions, importTags} from './import.database';
import {formatBlock} from '../database/block.database';
import {transactionFields, DatabaseTag, formatTransaction, formatAnsTransaction} from '../database/transaction.database';

config();
mkdir('snapshot');
mkdir('cache');

export const indices = JSON.parse(process.env.INDICES || '[]') as Array<string>;
export const storeSnapshot = process.env.SNAPSHOT === '1' ? true : false;
export const parallelization = parseInt(process.env.PARALLEL || '8');

export let SIGINT: boolean = false;
export let SIGKILL: boolean = false;
export let bar: ProgressBar;
export let topHeight = 0;
export let currentHeight = 0;

export const streams = {
  block: {
    snapshot: createWriteStream('snapshot/block.csv', {flags: 'a'}),
    cache: createWriteStream('cache/block.csv'),
  },
  transaction: {
    snapshot: createWriteStream('snapshot/transaction.csv', {flags: 'a'}),
    cache: createWriteStream('cache/transaction.csv'),
  },
  tags: {
    snapshot: createWriteStream('snapshot/tags.csv', {flags: 'a'}),
    cache: createWriteStream('cache/tags.csv'),
  },
};

export function configureSyncBar(start: number, end: number) {
  bar = new ProgressBar(
      ':current/:total blocks synced [:bar] :percent :etas',
      {
        complete: '|',
        incomplete: ' ',
        total: end - start,
      },
  );
}

export async function startSync() {
  if (parallelization > 0) {
    log.info(`[database] starting sync, parallelization is set to ${parallelization}`);
    if (storeSnapshot) {
      log.info('[snapshot] also writing new blocks to the snapshot folder');
    }

    if (existsSync('.snapshot')) {
      log.info('[database] existing sync state found');
      const state = parseInt(readFileSync('.snapshot').toString());

      if (!isNaN(state)) {
        const nodeInfo = await getNodeInfo();
        configureSyncBar(state, nodeInfo.height);
        topHeight = nodeInfo.height;
        log.info(`[database] database is currently at height ${state}, resuming sync to ${topHeight}`);
        bar.tick();
        await parallelize(state + 1);
      } else {
        log.info('[database] sync state is malformed. Please make sure it is a number');
        process.exit();
      }
    } else {
      const nodeInfo = await getNodeInfo();
      configureSyncBar(0, nodeInfo.height);
      topHeight = nodeInfo.height;
      log.info(`[database] syncing from block 0 to ${topHeight}`);
      bar.tick();
      await parallelize(0);
    }
  }
}

export async function parallelize(height: number) {
  currentHeight = height;

  if (height >= topHeight) {
    log.info('[database] fully synced, monitoring for new blocks');
    await sleep(30000);
    const nodeInfo = await getNodeInfo();
    if (nodeInfo.height > topHeight) {
      log.info(`[database] updated height from ${topHeight} to ${nodeInfo.height} syncing new blocks`);
    }
    topHeight = nodeInfo.height;
    await parallelize(height);
  } else {
    const batch = [];

    for (let i = height; i < height + parallelization && i < topHeight; i++) {
      batch.push(storeBlock(i));
    }

    SIGINT = true;

    await Promise.all(batch);

    await importBlocks(`${process.cwd()}/cache/block.csv`);
    await importTransactions(`${process.cwd()}/cache/transaction.csv`);
    await importTags(`${process.cwd()}/cache/tags.csv`);

    streams.block.cache = createWriteStream('cache/block.csv');
    streams.transaction.cache = createWriteStream('cache/transaction.csv');
    streams.tags.cache = createWriteStream('cache/tags.csv');

    if (!bar.complete) {
      bar.tick(batch.length);
    }

    writeFileSync('.snapshot', (height + batch.length).toString());

    SIGINT = false;

    if (SIGKILL === false) {
      await parallelize(height + batch.length);
    }
  }
}

export async function storeBlock(height: number) {
  try {
    const currentBlock = await block(height);
    const fb = formatBlock(currentBlock);
    const input = `"${fb.id}","${fb.previous_block}","${fb.mined_at}","${fb.height}","${fb.txs.replace(/"/g, '\\"')}","${fb.extended.replace(/"/g, '\\"')}"\n`;

    streams.block.cache.write(input);

    if (storeSnapshot) {
      streams.block.snapshot.write(input);
    }

    if (height > 0) {
      await storeTransactions(JSON.parse(fb.txs) as Array<string>, height);
    }
  } catch (error) {
    log.info(`[snapshot] could not retrieve block at height ${height}, retrying`);
    if (SIGKILL === false) {
      await storeBlock(height);
    }
  }
}

export async function storeTransactions(txs: Array<string>, height: number) {
  const batch = [];

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    batch.push(storeTransaction(tx, height));
  }

  await Promise.all(batch);
}

export async function storeTransaction(tx: string, height: number) {
  try {
    const currentTransaction = await transaction(tx);
    const ft = formatTransaction(currentTransaction);
    const preservedTags = JSON.parse(ft.tags) as Array<Tag>;
    ft.tags = `${ft.tags.replace(/"/g, '\\"')}`;

    const fields = transactionFields
        .map((field) => `"${ft[field] ? ft[field] : ''}"`)
        .concat(indices.map((ifield) => `"${ft[ifield] ? ft[ifield] : ''}"`));

    const input = `${fields.join(',')}\n`;

    streams.transaction.cache.write(input);

    if (storeSnapshot) {
      streams.transaction.snapshot.write(input);
    }

    storeTags(ft.id, preservedTags);

    const ans102 = tagValue(preservedTags, 'Bundle-Type') === 'ANS-102';

    if (ans102) {
      try {
        const ansPayload = await getData(ft.id);
        const ansTxs = await ansBundles.unbundleData(ansPayload);

        await processANSTransaction(ansTxs);
      } catch (error) {
        console.log('');
        log.info(`[database] malformed ANS payload at height ${height} for tx ${ft.id}`);
      }
    }
  } catch (error) {
    console.log('');
    log.info(`[database] could not retrieve tx ${tx} at height ${height}`);
  }
}

export async function processANSTransaction(ansTxs: Array<DataItemJson>) {
  for (let i = 0; i < ansTxs.length; i++) {
    const ansTx = ansTxs[i];
    const ft = formatAnsTransaction(ansTx);
    ft.tags = `${ft.tags.replace(/"/g, '\\"')}`;

    const ansTags = ansTx.tags;

    const fields = transactionFields
        .map((field) => `"${ft[field] ? ft[field] : ''}"`)
        .concat(indices.map((ifield) => `"${ft[ifield] ? ft[ifield] : ''}"`));

    const input = `${fields.join(',')}\n`;

    streams.transaction.cache.write(input);

    if (storeSnapshot) {
      streams.transaction.snapshot.write(input);
    }

    for (let ii = 0; ii < ansTags.length; ii++) {
      const ansTag = ansTags[ii];
      const {name, value} = ansTag;

      const tag: DatabaseTag = {
        tx_id: ansTx.id,
        index: ii,
        name: name || '',
        value: value || '',
      };

      const input = `"${tag.tx_id}","${tag.index}","${tag.name}","${tag.value}"\n`;

      streams.tags.cache.write(input);

      if (storeSnapshot) {
        streams.tags.snapshot.write(input);
      }
    }
  }
}

export function storeTags(tx_id: string, tags: Array<Tag>) {
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    const input = `"${tx_id}","${i}","${tag.name}","${tag.value}"\n`;

    streams.tags.cache.write(input);

    if (storeSnapshot) {
      streams.tags.snapshot.write(input);
    }
  }
}

process.on('SIGINT', () => {
  log.info('[database] ensuring all blocks are stored before exit, you may see some extra output in console');
  SIGKILL = true;
  setInterval(() => {
    if (SIGINT === false) {
      log.info('[database] block sync state preserved, now exiting');
      process.exit();
    }
  }, 100);
});
