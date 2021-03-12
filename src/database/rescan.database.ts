import ProgressBar from 'progress';
import {existsSync, createReadStream, createWriteStream, readFileSync, writeFileSync, unlinkSync} from 'fs';
import {split, mapSync} from 'event-stream';
import {config} from 'dotenv';
import {log} from '../utility/log.utility';
import {mkdir} from '../utility/file.utility';
import {importTransactions, importTags} from '../database/import.database';
import {storeTransaction, processAns, streams} from '../database/sync.database';

config();
mkdir('snapshot');
mkdir('cache');

export interface TxStream {
    tx: string;
    height: string;
    type: string;
}

export const rescan = createWriteStream('.rescan.temp');
export let bar: ProgressBar;

export async function startRescan(path: string = 'cache/.rescan') {
  log.info('[rescan] starting rescan');

  if (existsSync(path)) {
    log.info('[rescan] found existing rescan file. Indexing missing transactions.');
    await streamTransactions(path);
  }
}

export async function streamTransactions(path: string) {
  const txs: Array<TxStream> = [];

  createReadStream(path)
      .pipe(split())
      .pipe(mapSync((line: string) => {
        const [tx, height, type] = line.split(',');
        txs.push({tx, height, type});
      }))
      .on('end', async () => {
        txs.pop();

        for (let i = 0; i < txs.length; i++) {
          const {tx, height, type} = txs[i];
          await restoreTransaction(tx, height, type);
        }

        const rescan = readFileSync('.rescan.temp');
        writeFileSync(path, rescan);
        unlinkSync('.resync.temp');

        log.info('[rescan] complete, unindexed transaction stored in .rescan');

        process.exit();
      });
}

export async function restoreTransaction(tx: string, height: string, type: string) {
  try {
    if (type === 'normal') {
      await storeTransaction(tx, Number(height));
    }

    if (type === 'ans') {
      await processAns(tx, Number(height));
    }

    await importTransactions(`${process.cwd()}/cache/transaction.csv`);
    await importTags(`${process.cwd()}/cache/tags.csv`);

    streams.transaction.cache = createWriteStream('cache/transaction.csv');
    streams.tags.cache = createWriteStream('cache/tags.csv');

    log.info(`[rescan] successfully added missing tx ${tx} at height ${height}`);
  } catch (error) {
    log.info(`[rescan] failed ${tx} at ${height}, added to the .rescan.temp file. It was not added to the database`);
    rescan.write(`${tx},${height}\n`);
  }
}
