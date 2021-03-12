import morgan from 'morgan';
import id from 'shortid';
import {Request, Response, NextFunction} from 'express';
import fs from 'fs';
import path from 'path';

// TODO: @theloneronin what's the best place to put this file?
const logFileLocation = path.join(__dirname, '../../access.log');
const accessLogStream = fs.createWriteStream(logFileLocation, {flags: 'a'});

export function logConfigurationMiddleware(req: Request, res: Response, next: NextFunction) {
  const trace = id.generate();

  req.id = trace;
  res.header('X-Trace', trace);

  return next();
}

morgan.token('trace', (req: Request) => {
  return req.id || 'UNKNOWN';
});

// TODO - add encryption on the line below for :remote-addr to protect viewer's privacy
export const logMiddleware = morgan('{"address":":remote-addr","user":":remote-user","date":":date","method":":method","url":":url","type":"HTTP/:http-version","status":":status","res":{"length":":res[content-length]","time" : ":response-time ms"}, "ref":":referrer","agent":":user-agent", "trace":":trace"}', {stream: accessLogStream});
