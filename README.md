# TestWeave Docker

This is the docker container to spin up a Arweave Test Network on your machine. The docker contains both a full arweave node and an arweave gateway. After having build and lunched it, you will be able to use the [TestWeave SDK](https://github.com/ArweaveTeam/testweave-sdk). 


## Usage

Clone this repo, then run: 

```shell
docker-compose build
```

Be very patient and wait that the docker builds. Then run: 

```shell
docker-compose up // add a -d if you want to run it in detached mode 
```

Now you have a full arweave node running at http://localhost:1984, a full gateway running at http://localhost:3000 and a full graphql client running at http://localhost:3000/graphql 