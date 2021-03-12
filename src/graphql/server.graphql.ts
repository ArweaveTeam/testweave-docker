import {readFileSync} from 'fs';
import {ApolloServer, ApolloServerExpressConfig, gql} from 'apollo-server-express';
import {connection} from '../database/connection.database';
import {resolvers} from './resolver.graphql';

const typeDefs = gql(readFileSync(`${process.cwd()}/types.graphql`, 'utf8'));

export function graphServer(opts: ApolloServerExpressConfig = {}) {
  return new ApolloServer({
    typeDefs,
    resolvers,
    debug: false,
    context: ({req}) => {
      return {
        req,
        connection,
      };
    },
    ...opts,
  });
}
