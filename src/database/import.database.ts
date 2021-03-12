import {config} from 'dotenv';
import {connection} from '../database/connection.database';
import {transactionFields} from '../database/transaction.database';

config();

export const indices = JSON.parse(process.env.INDICES || '[]') as Array<string>;

export async function importBlocks(path: string) {
  return new Promise(async (resolve) => {
    await connection.raw(`
        COPY
          blocks
          (id, previous_block, mined_at, height, txs, extended)
        FROM
          '${path}'
        WITH
          (
            FORMAT CSV,
            ESCAPE '\\',
            DELIMITER ',',
            FORCE_NULL(height)
          )
        `);

    return resolve(true);
  });
}

export async function importTransactions(path: string) {
  return new Promise(async (resolve) => {
    const fields = transactionFields
        .concat(indices)
        .map((field) => `"${field}"`);

    await connection.raw(`
        COPY
          transactions
          (${fields.join(',')})
        FROM
          '${path}'
        WITH
          (
            FORMAT CSV,
            ESCAPE '\\',
            DELIMITER ',',
            FORCE_NULL("format", "height", "data_size")
          )`);

    return resolve(true);
  });
}

export async function importTags(path: string) {
  return new Promise(async (resolve) => {
    await connection.raw(`
        COPY
          tags
          (tx_id, index, name, value)
        FROM
          '${path}'
        WITH
          (
            FORMAT CSV,
            ESCAPE '\\',
            DELIMITER ',',
            FORCE_NULL(index)
          )
        `);

    return resolve(true);
  });
}
