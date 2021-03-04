import {config} from 'dotenv';
import {Config} from 'knex';

config();

export default {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  pool: {
    min: 1,
    max: 10,
  },
  migrations: {
    tableName: 'migrations',
    loadExtensions: ['.ts'],
    extension: 'ts',
    directory: './migrations',
    schemaName: 'public',
  },
} as Config;
