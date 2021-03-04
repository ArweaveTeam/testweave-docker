import {createLogger, transports, format} from 'winston';

export const log = createLogger({
  level: 'info',
  transports: new transports.Console({
    format: format.simple(),
  }),
});
