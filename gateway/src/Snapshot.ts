import ProgressBar from 'progress';
import {DataItemJson} from 'arweave-bundles';
import {config} from 'dotenv';
import {existsSync, readFileSync, writeFileSync, createWriteStream} from 'fs';
import {ansBundles} from './utility/ans.utility';
import {mkdir} from './utility/file.utility';
import {log} from './utility/log.utility';
import {sleep} from './utility/sleep.utility';
import {getNodeInfo, getData} from './query/node.query';
import {block} from './query/block.query';
import {transaction, tagValue, Tag} from './query/transaction.query';
import {formatBlock} from './database/block.database';
import {transactionFields, DatabaseTag, formatTransaction, formatAnsTransaction} from './database/transaction.database';

config();
mkdir('snapshot');

export const indices = JSON.parse(process.env.INDICES || '[]') as Array<string>;
export const parallelization = parseInt(process.env.PARALLEL || '8');

export let SIGINT: boolean = false;
export let SIGKILL: boolean = false;

export let bar: ProgressBar;
export let topHeight = 0;

export const streams = {
  block: createWriteStream('snapshot/block.csv', {flags: 'a'}),
  transaction: createWriteStream('snapshot/transaction.csv', {flags: 'a'}),
  tags: createWriteStream('snapshot/tags.csv', {flags: 'a'}),
};

export function configureSnapshotBar(start: number, end: number) {
  bar = new ProgressBar(
      ':current/:total blocks synced [:bar] :percent :etas',
      {
        complete: '|',
        incomplete: ' ',
        total: end - start,
      },
  );
}

export async function snapshot() {
  if (existsSync('.snapshot')) {
    log.info('[snapshot] existing snapshot state found');
    const snapshotState = parseInt(readFileSync('.snapshot').toString());

    if (!isNaN(snapshotState)) {
      const nodeInfo = await getNodeInfo();
      configureSnapshotBar(snapshotState, nodeInfo.height);
      topHeight = nodeInfo.height;
      log.info(`[snapshot] snapshot is currently at height ${snapshotState}, resuming sync to ${topHeight}`);
      bar.tick();
      await parallelize(snapshotState + 1);
    } else {
      log.info('[snapshot] snapshot state is malformed. Please make sure it is a number');
      process.exit();
    }
  } else {
    const nodeInfo = await getNodeInfo();
    configureSnapshotBar(0, nodeInfo.height);
    topHeight = nodeInfo.height;
    log.info(`[snapshot] new snapshot is being generated, syncing from block 0 to ${topHeight}`);
    bar.tick();
    await parallelize(0);
  }
}

export async function parallelize(height: number) {
  if (height >= topHeight) {
    log.info('[snapshot] fully synced, monitoring for new blocks');
    await sleep(30000);
    const nodeInfo = await getNodeInfo();
    if (nodeInfo.height > topHeight) {
      log.info(`[snapshot] updated height from ${topHeight} to ${nodeInfo.height} syncing new blocks`);
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

    if (!bar.complete) {
      bar.tick(batch.length);
    }

    writeFileSync('.snapshot', (height + batch.length).toString());
    writeFileSync('snapshot/.snapshot', (height + batch.length).toString());

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

    streams.block.write(input);

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

    streams.transaction.write(input);

    storeTags(ft.id, preservedTags);

    const ans102 = tagValue(preservedTags, 'Bundle-Type') === 'ANS-102';

    if (ans102) {
      try {
        const ansPayload = await getData(ft.id);
        const ansTxs = await ansBundles.unbundleData(ansPayload);

        await processANSTransaction(ansTxs);
      } catch (error) {
        console.log('');
        log.info(`[snapshot] malformed ANS payload at height ${height} for tx ${ft.id}`);
      }
    }
  } catch (error) {
    console.log('');
    log.info(`[snapshot] could not retrieve tx ${tx} at height ${height}`);
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

    streams.transaction.write(input);

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

      streams.tags.write(input);
    }
  }
}

export function storeTags(tx_id: string, tags: Array<Tag>) {
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    const input = `"${tx_id}","${i}","${tag.name}","${tag.value}"\n`;

    streams.tags.write(input);
  }
}

(async () => await snapshot())();

process.on('SIGINT', () => {
  SIGKILL = true;
  setInterval(() => {
    if (SIGINT === false) {
      streams.block.end();
      streams.transaction.end();
      streams.tags.end();
      process.exit();
    }
  }, 100);
});
