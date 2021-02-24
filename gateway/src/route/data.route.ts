import {Request, Response} from 'express';
import {transaction as getTransaction} from '../query/transaction.query';
import {getTransactionOffset, getChunk} from '../query/chunk.query';

export const dataRouteRegex = /^\/?([a-zA-Z0-9-_]{43})\/?$|^\/?([a-zA-Z0-9-_]{43})\/(.*)$/i;
export const pathRegex = /^\/?([a-z0-9-_]{43})/i;

export async function dataHeadRoute(req: Request, res: Response) {
  const path = req.path.match(pathRegex) || [];
  const transaction = path.length > 1 ? path[1] : '';
  const metadata = await getTransaction(transaction);

  res.status(200);
  res.setHeader('accept-ranges', 'bytes');
  res.setHeader('content-length', Number(metadata.data_size));

  res.end();
}

export async function dataRoute(req: Request, res: Response) {
  const path = req.path.match(pathRegex) || [];
  const transaction = path.length > 1 ? path[1] : '';

  const {startOffset, endOffset} = await getTransactionOffset(transaction);

  let byte = 0;

  while (startOffset + byte < endOffset) {
    const chunk = await getChunk(startOffset + byte);
    byte += chunk.parsed_chunk.length;

    res.write(chunk.response_chunk);
  }

  res.status(200);
  res.end();
}
