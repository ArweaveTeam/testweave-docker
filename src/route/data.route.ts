
import {Request, Response} from 'express';
import {stringToBip39, stringToHash} from '../utility/bip39.utility';
import {transaction as getTransaction, tagValue} from '../query/transaction.query';
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
  const hostname = req.hostname;

  if (hostname !== 'localhost' && process.env.MANIFESTS === '1') {
    const subdomain = process.env.BIP39 === '1' ? stringToBip39(transaction) : stringToHash(transaction);

    if (hostname.indexOf(subdomain) === -1) {
      return res.redirect(308, `http://${subdomain}.${hostname}/${transaction}`);
    }
  }

  const metadata = await getTransaction(transaction);
  const contentType = tagValue(metadata.tags, 'Content-Type');

  res.setHeader('content-type', contentType);
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
