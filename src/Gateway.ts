import 'colors';
import express, {Express} from 'express';
import {config} from 'dotenv';
import {corsMiddleware} from './middleware/cors.middleware';
import {jsonMiddleware} from './middleware/json.middleware';
import {log} from './utility/log.utility';
import {graphServer} from './graphql/server.graphql';
import {statusRoute} from './route/status.route';
import {proxyRoute} from './route/proxy.route';
import {dataRouteRegex, dataHeadRoute, dataRoute} from './route/data.route';
import {startSync} from './database/sync.database';

config();

export const app: Express = express();

export function start() {
  app.set('trust proxy', 1);
  app.use(corsMiddleware);
  app.use(jsonMiddleware);

  app.get('/status', statusRoute);
  app.head(dataRouteRegex, dataHeadRoute);
  app.get(dataRouteRegex, dataRoute);

  graphServer({introspection: true, playground: true}).applyMiddleware({app, path: '/graphql'});

  app.all('*', proxyRoute);

  app.listen(process.env.PORT || 3000, () => {
    log.info(`[app] started on http://localhost:${process.env.PORT || 3000}`);
    startSync();
  });
}


(async () => await start())();
