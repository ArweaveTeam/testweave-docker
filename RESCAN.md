# Rescan Guide

While syncing, sometimes transactions may not be returned by Arweave Nodes. You can recover these transactions by running a rescan.
If you received an error while retrieving a transaction while running a node. You can recover it by running.

```bash
yarn rescan:cache
```

## Rescanning Snapshots

If you are recovering from an imported snapshot. It should list missing transactions in the Snapshot under `snapshot/.rescan`.

You can recover snapshot transactions by running.

```bash
yarn rescan:snapshot
```
