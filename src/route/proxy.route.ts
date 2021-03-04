import {Request, Response} from 'express';
import {grabNode} from '../query/node.query';

export async function proxyRoute(req: Request, res: Response) {
  return res.redirect(308, `${grabNode()}/${req.path}`);
}
