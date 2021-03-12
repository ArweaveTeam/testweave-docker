import {Request, Response, NextFunction} from 'express';

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', req.method);
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  return next();
}
