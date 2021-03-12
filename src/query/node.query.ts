import {get} from 'superagent';
import {getTransactionOffset, getChunk} from './chunk.query';

export const NODES = process.env.ARWEAVE_NODES ? JSON.parse(process.env.ARWEAVE_NODES) : ['http://lon-1.eu-west-1.arweave.net:1984'];

export function grabNode() {
  return NODES[Math.floor(Math.random() * NODES.length)];
}

export interface InfoType {
  network: string;
  version: number;
  release: number;
  height: number;
  current: string;
  blocks: number;
  peers: number;
  queue_length: number;
  node_state_latency: number;
}

export async function getNodeInfo(): Promise<InfoType> {
  const payload = await get(`${grabNode()}/info`);
  const body = JSON.parse(payload.text);

  return {
    network: body.network,
    version: body.version,
    release: body.release,
    height: body.height,
    current: body.current,
    blocks: body.blocks,
    peers: body.peers,
    queue_length: body.queue_length,
    node_state_latency: body.node_state_latency,
  };
}

export async function getData(id: string): Promise<any> {
  const payload = await get(`${grabNode()}/${id}`);
  return payload.body;
}

export function getDataAsStream(id: string) {
  return get(`${grabNode()}/${id}`);
}

export async function getDataFromChunks(id: string): Promise<any> {
  const {startOffset, endOffset} = await getTransactionOffset(id);

  let byte = 0;
  let chunks = '';

  while (startOffset + byte < endOffset) {
    const chunk = await getChunk(startOffset + byte);
    byte += chunk.parsed_chunk.length;
    chunks += chunk.response_chunk;
  }

  return chunks;
}
