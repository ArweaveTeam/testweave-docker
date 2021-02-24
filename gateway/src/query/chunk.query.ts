import {get} from 'superagent';
import {b64UrlToBuffer} from '../utility/encoding.utility';
import {grabNode} from './node.query';

export interface TransactionOffsetType {
    size: number;
    endOffset: number;
    startOffset: number;
}

export interface ChunkType {
    tx_path: string;
    data_path: string;
    chunk: string;
    parsed_chunk: Uint8Array;
    response_chunk: string;
}

export const decoder = new TextDecoder();

export async function getTransactionOffset(id: string): Promise<TransactionOffsetType> {
  const payload = await get(`${grabNode()}/tx/${id}/offset`);
  const body = JSON.parse(payload.text);

  const size = parseInt(body.size);
  const endOffset = parseInt(body.offset);
  const startOffset = endOffset - size + 1;

  return {
    size,
    endOffset,
    startOffset,
  };
}

export async function getChunk(offset: number, retry: boolean = true): Promise<ChunkType> {
  try {
    const payload = await get(`${grabNode()}/chunk/${offset}`);
    const body = JSON.parse(payload.text);

    const parsed_chunk = b64UrlToBuffer(body.chunk);
    const response_chunk = decoder.decode(parsed_chunk);

    return {
      tx_path: body.tx_path,
      data_path: body.data_path,
      chunk: body.chunk,
      parsed_chunk,
      response_chunk,
    };
  } catch (error) {
    if (retry) {
      return getChunk(offset, false);
    } else {
      throw new Error(error);
    }
  }
}
