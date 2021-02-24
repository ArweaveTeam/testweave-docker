import {Transaction, QueryBuilder} from 'knex';
import {BlockType} from '../query/block.query';
import {TransactionType} from '../query/transaction.query';
import {formatBlock} from './block.database';
import {formatTransaction, DatabaseTag} from './transaction.database';

export function createBatchItem(batchScope: Transaction, table: string, data: object, conflictKey: string = 'id'): QueryBuilder {
  return batchScope
      .insert(data)
      .into(table)
      .onConflict(conflictKey as any)
      .ignore();
}

export function createBatchItemForTag(batchScope: Transaction, table: string, data: object): QueryBuilder {
  return batchScope
      .insert(data)
      .into(table);
}

export function createBlockBatchItem(batchScope: Transaction, block: BlockType): QueryBuilder {
  const formattedBlock = formatBlock(block);
  return createBatchItem(batchScope, 'blocks', formattedBlock);
}

export function createTransactionBatchItem(batchScope: Transaction, transaction: TransactionType): QueryBuilder {
  const formattedTransaction = formatTransaction(transaction);
  return createBatchItem(batchScope, 'transactions', formattedTransaction);
}

export function createTagBatchItem(batchScope: Transaction, tag: DatabaseTag): QueryBuilder {
  return createBatchItemForTag(batchScope, 'tags', tag);
}
