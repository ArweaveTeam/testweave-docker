# Arweave Gateway

![License](https://img.shields.io/badge/license-MIT-blue.svg)
[![Build Status](https://travis-ci.org/ArweaveTeam/gateway.svg?branch=master)](https://travis-ci.org/ArweaveTeam/gateway)
[![codecov](https://codecov.io/gh/ArweaveTeam/gateway/branch/master/graph/badge.svg)](https://codecov.io/gh/ArweaveTeam/gateway)

Review the [documentation](./docs/README.md) to learn more about setting up and deploying a Gateway.

## Requirements

1. A Unix OS

2. Docker and Docker Compose LTS

### Suggested Hardware

There are several million transactions on the Arweave chain. In order to effectively serve content on the gateway you'll need a decent sized computer. The ideal specs for a Gateway should have the following:

1. 16GB RAM (ideally 32GB RAM)

2. ~1TB of SSD storage available

3. Intel i5 / AMD FX or greater, +4 vCPUs should be more than enough, these are typically Intel Xeon CPUs.

## Environment

By default, there is a default environment you can use located at `.env.docker` in the repository.

```env
ARWEAVE_NODES=["https://arweave.net"]

DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=arweave
DATABASE_PASSWORD=arweave
DATABASE_NAME=arweave

ENVIRONMENT=public
MANIFESTS=0
BIP39=0
PORT=3000

PARALLEL=4
SNAPSHOT=0

INDICES=["App-Name", "app", "domain", "namespace"]
```

Make sure you copy this configuration to `.env`.

```bash
cp .env.docker .env
```

## Compilation

You can start the server with `docker-compose`.

```bash
# with npm
npm run docker:start

# with yarn
yarn docker:start

# with pure docker-compose
docker-compose up --build -d
```

You can spin down the `docker-compose` cluster with.

```bash
# with npm
npm run docker:stop

# with yarn
yarn docker:stop

# with pure docker-compose
docker-compose down
```

## Testing

You can test if the server and the GraphQL queries are working properly by navigating to.

```bash
http://localhost:3000/graphql
```

This webpage should look similar to.

```bash
https://arweave.dev/graphql
```
