# Gateway Development Guide

If you want to develop and contribute to the Gateway source code, use this guide as a reference for development and starting a server. If you're looking to deploy a Gateway. We suggest using the normal guide found [here.](./README.md)

## Requirements

1. A Unix OS

2. Postgres v10+

3. Node.js v12.20.1

## Node Version

*Please note there may be some problems with Node v14 LTS or later. If necessary run.*

```bash
# Install Node.js v12 LTS
nvm install 12
# Or just use v12 LTS if already installed
nvm use 12
```

## Configuring Postgres

Before you begin, you'll need to create and configure the Database and User.

```bash
# Access PSQL Terminal
sudo -u postgres psql

# Create the arweave database and user
CREATE DATABASE arweave;
CREATE USER arweave WITH ENCRYPTED PASSWORD 'arweave';
GRANT ALL PRIVILEGES ON DATABASE arweave TO arweave;

# Required in order to import blocks from a snapshot
ALTER ROLE arweave WITH SUPERUSER;

# exit PSQL Terminal
exit
```

## Environment

By default, there is a development environment you can use located at `.env.dev` in the repository. This `.dev` environment is different to the `.env.docker` environment which is designed for `docker` usage.

```env
ARWEAVE_NODES=["https://arweave.net"]

DATABASE_HOST=0.0.0.0
DATABASE_PORT=5432
DATABASE_USER=arweave
DATABASE_PASSWORD=arweave
DATABASE_NAME=arweave

ENVIRONMENT=public
PORT=3000

PARALLEL=4
SNAPSHOT=0

INDICES=["App-Name", "app", "domain", "namespace"]
```

Make sure you copy this configuration to `.env`.

```bash
cp .env.dev .env
```

## Block Synchronization

If at any point or time you want to increase the parallelization level of block synchronization. You should change the `PARALLEL` variable.

This variable indicates how many blocks to query concurrently. You can change it to any amount of blocks you please.

```env
PARALLEL=16
```

If you want to disable block synchronization. Simply set `PARALLEL` to `0`.

```env
PARALLEL=0
```

## Deploying Migrations with Knex

For development purposes, you will want to debug Knex migrations.

To spin up the tables for Postgres run:

```bash
yarn migrate:latest
```

To drop the tables run:

```bash
yarn migrate:down
```

## Developing

Assuming everything was smooth with the above. You can now run.

```bash
yarn dev:start
```

You can now test queries on.

```bash
http://localhost:3000/graphql
```

This webpage should look similar to.

```bash
https://arweave.dev/graphql
```

### Additional Commands

If you're doing a lot of work related to do databases. You might want to use `yarn dev:restart` as it resets the database.

```bash
yarn dev:restart
```

If you're updating the graphql library as seen in `types.graphql`. You should run `yarn dev:gql` to update the GraphQL types.

```bash
yarn dev:gql
```

Also make sure before pushing a commit. The project passes the lint tests.

```bash
yarn dev:lint
```

You can also automatically fix and format files using.

```bash
yarn dev:lint --fix
```
