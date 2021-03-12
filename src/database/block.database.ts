import moment from 'moment';
import {pick} from 'lodash';
import {BlockType} from '../query/block.query';

export interface BlockDatabaseType {
    id: string;
    previous_block: string;
    mined_at: string;
    height: number;
    txs: string;
    extended: string;
}

export const blockExtendedFields = [
  'diff',
  'hash',
  'reward_addr',
  'last_retarget',
  'tx_root',
  'tx_tree',
  'reward_pool',
  'weave_size',
  'block_size',
  'cumulative_diff',
  'hash_list_merkle',
  'tags',
];

export function formatBlock(block: BlockType): BlockDatabaseType {
  return {
    id: block.indep_hash,
    height: block.height,
    previous_block: block.previous_block,
    txs: JSON.stringify(block.txs),
    mined_at: moment(block.timestamp * 1000).format(),
    extended: JSON.stringify(pick(block, blockExtendedFields)),
  };
}
