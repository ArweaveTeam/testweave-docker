# Snapshots

Use this guide to generate your own snapshots or import a snapshot.

## Generate a Snapshot

You can generate a snapshot while syncing your node by enabling snapshots with the `SNAPSHOT=1` variable in your environment file.

However, you can have an instance solely dedicated to creating a snapshot file by running `yarn dev:snapshot`.

You can configure the level of block synchronization by modifying the `PARALLEL` variable.

**Examples**

```bash
# Sync 4 blocks at a time when running yarn dev:snapshot
PARALLEL=4
SNAPSHOT=1
```

```bash
# Sync 8 blocks at a time
PARALLEL=8
SNAPSHOT=1
```

When generating a snapshot. Output will appear in the `snapshot` folder. You can tar.gz the archive by running.

```bash
tar -zcvf snapshot.tar.gz snapshot
```

You can then upload the snapshot to Arweave by running.

```bash
arweave deploy snapshot.tar.gz
```

## Importing a Snapshot

If you want to import a snapshot. You need to make sure import the `.csv` files into the `snapshot` folder. It should look something like.

```bash
snapshot/block.csv
snapshot/transaction.csv
snapshot/tags.csv
```

If you're downloading a `.tar.gz` file. You can decompress it by running.

```bash
tar -zxf snapshot.tar.gz -C snapshot
```

You can then run the import command.

```bash
yarn dev:import
```

If successful, it should output.

```bash
info: [snapshot] successfully imported block.csv
info: [snapshot] successfully imported transaction.csv
info: [snapshot] successfully imported tags.csv
```

Make sure when running an actual Gateway you copy the `.snapshot` file from the `snapshot` folder into the root directory.

```bash
mkdir cache
cp snapshot/.snapshot cache/.snapshot
```