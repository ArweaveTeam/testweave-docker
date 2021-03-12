import {log} from './utility/log.utility';
import {importBlocks, importTransactions, importTags} from './database/import.database';

export async function importSnapshot() {
  await importBlocks(`${process.cwd()}/snapshot/block.csv`);
  log.info('[snapshot] successfully imported block.csv');

  await importTransactions(`${process.cwd()}/snapshot/transaction.csv`);
  log.info('[snapshot] successfully imported transaction.csv');

  await importTags(`${process.cwd()}/snapshot/tags.csv`);
  log.info('[snapshot] successfully imported tags.csv');

  process.exit();
}

(async () => await importSnapshot())();
