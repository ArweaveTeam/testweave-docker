import knex from 'knex';
import {config} from 'dotenv';

config();

export const connection: knex = knex({
  client: 'pg',
  pool: {min: 10, max: 10000},
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
});
