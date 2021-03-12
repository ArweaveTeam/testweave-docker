import fs from 'fs';
import {Request, Response} from 'express';
import path from 'path';
import {sha256} from 'js-sha256';
import cryptoRandomString = require('crypto-random-string')

export const logFileLocation = path.join(__dirname, '../../daily.log');
export const rawLogFileLocation = path.join(__dirname, '../../access.log');

export interface RawLogs {
  address: string,
  user: string,
  date: string,
  method: string,
  uniqueId: string,
  url: string,
  ref: string,
}

export interface FormattedLogs {
  addresses: string[],
  url: string
}

export interface FormattedLogsArray extends Array<FormattedLogs> {
  [key: string]: any
}

export interface DataInterface {
  lastUpdate: Date;
  summary: Array<any>;
}

export function getLogSalt() {
  return sha256(cryptoRandomString({length: 10}));
}

export function logsHelper(req: Request, res: Response) {
  fs.readFile(logFileLocation, 'utf8', (err: any, data: any) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
      return;
    }
    res.status(200).send(data);
  });
};

export async function logsTask() {
  return new Promise(async (resolve, reject) => {
    try {
      const masterSalt = getLogSalt();
      const rawLogs = await readRawLogs(masterSalt) as RawLogs[];
      const sorted = await sortAndFilterLogs(rawLogs) as FormattedLogsArray;
      const result = await writeDailyLogs(sorted);

      await clearRawLogs();

      return resolve(result);
    } catch (err) {
      console.error('error writing daily log file', err);
      reject(err);
    }
  });
};

export async function readRawLogs(masterSalt: string) {
  return new Promise((resolve, reject) => {
    const logs = fs.readFileSync(rawLogFileLocation).toString().split('\n');
    const prettyLogs = [] as RawLogs[];
    for (const log of logs) {
      try {
        if (log && !(log === ' ') && !(log === ' ')) {
          try {
            const logJSON = JSON.parse(log) as RawLogs;
            logJSON.uniqueId = sha256(logJSON.url);
            logJSON.address = sha256.hmac(masterSalt, logJSON.address);
            prettyLogs.push(logJSON);
          } catch (err) {
            console.error('error reading json', err);
            reject(err);
          }
        } else {
          console.error('tried to parse log, but skipping because log is ', log);
        }
      } catch (err) {
        console.error('err', err);
        reject(err);
      }
    }
    resolve(prettyLogs);
  });
}

export async function writeDailyLogs(logs:FormattedLogsArray) {
  return new Promise((resolve) => {
    const data: DataInterface = {
      lastUpdate: new Date(),
      summary: [],
    };

    for (const key in logs) {
      if (logs[key]) {
        const log = logs[key];
        if (log && log.addresses) {
          data.summary.push(log);
        }
      }
    }
    fs.writeFile(logFileLocation, JSON.stringify(data), {}, function(err) {
      if (err) {
        console.log('ERROR SAVING ACCESS LOG', err);
        resolve({success: false, logs: data, error: err});
      } else {
        resolve({success: true, logs: data});
      }
    });
  });
}

export async function sortAndFilterLogs(logs: RawLogs[]) {
  return new Promise((resolve, reject) => {
    const formatted_logs = [] as FormattedLogsArray;

    try {
      for (const log of logs) {
        if (log.url && log.uniqueId) {
          if (formatted_logs[log.uniqueId] && !formatted_logs[log.uniqueId].addresses.includes(log.address)) {
            formatted_logs[log.uniqueId].addresses.push(log.address);
          } else {
            formatted_logs[log.uniqueId] = {
              addresses: [log.address],
              url: log.url,
            };
          }
        }
      }
      resolve(formatted_logs);
    } catch (err) {
      reject(err);
    }
  });
}

export async function clearRawLogs() {
  return new Promise((resolve, reject) => {
    fs.truncate(rawLogFileLocation, 0, function() {
      resolve(true);
    });
  });
}
