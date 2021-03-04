import {get} from 'superagent';
import {grabNode} from './node.query';

export interface BlockType {
    nonce: string;
    previous_block: string;
    timestamp: number;
    last_retarget: number;
    diff: string;
    height: number;
    hash: string;
    indep_hash: string;
    txs: Array<string>;
    tx_root: string;
    tx_tree: Array<string>;
    wallet_list: string;
    reward_addr: string;
    tags: Array<string>;
    reward_pool: number;
    weave_size: number;
    block_size: number;
    cumulative_diff: string;
    hash_list_merkle: string;
    poa: {
        option: string;
        tx_path: string;
        chunk: string;
    };
}

export async function block(height: number): Promise<BlockType> {
  const payload = await get(`${grabNode()}/block/height/${height}`);
  const body = JSON.parse(payload.text);

  return {
    nonce: body.nonce,
    previous_block: body.previous_block,
    timestamp: body.timestamp,
    last_retarget: body.last_retarget,
    diff: body.diff,
    height: body.height,
    hash: body.hash,
    indep_hash: body.indep_hash,
    txs: body.txs,
    tx_root: body.tx_root,
    tx_tree: body.tx_tree,
    wallet_list: body.wallet_list,
    reward_addr: body.reward_addr,
    tags: body.tags,
    reward_pool: body.reward_pool,
    weave_size: body.weave_size,
    block_size: body.block_size,
    cumulative_diff: body.cumulative_diff,
    hash_list_merkle: body.hash_list_merkle,
    poa: {
      option: body.poa?.option,
      tx_path: body.poa?.tx_path,
      chunk: body.poa?.chunk,
    },
  };
}

export async function currentBlock(): Promise<BlockType> {
  const payload = await get(`${grabNode()}/block/current`);
  const body = JSON.parse(payload.text);

  return {
    nonce: body.nonce,
    previous_block: body.previous_block,
    timestamp: body.timestamp,
    last_retarget: body.last_retarget,
    diff: body.diff,
    height: body.height,
    hash: body.hash,
    indep_hash: body.indep_hash,
    txs: body.txs,
    tx_root: body.tx_root,
    tx_tree: body.tx_tree,
    wallet_list: body.wallet_list,
    reward_addr: body.reward_addr,
    tags: body.tags,
    reward_pool: body.reward_pool,
    weave_size: body.weave_size,
    block_size: body.block_size,
    cumulative_diff: body.cumulative_diff,
    hash_list_merkle: body.hash_list_merkle,
    poa: {
      option: body.poa.option,
      tx_path: body.poa.tx_path,
      chunk: body.poa.chunk,
    },
  };
}
