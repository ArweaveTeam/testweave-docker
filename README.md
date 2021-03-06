# Arweave TetsWeave Docker

This repository contains the docker that setups a full arweave-node, including a gateway, on a local device. After having built and run this docker, you'll be able to use the [TestWeave SDK](https://github.com/ArweaveTeam/testweave-sdk) for testing your arweave application locally. 

# Prerequisite 
1. [Docker](https://docs.docker.com/engine/install/): version 16 or higher 
2. [Docker-Compose](https://docs.docker.com/compose/install/): verison ~1.27 or higher 

# Usage

1. Be sure to have docker and docker-compose on your system. 
2. Clone this repo;
3. Run `docker-compose build` and wait patiently that the docker composes. You should do this only once;
4. Run `docker-compose up` (add a `-d` flag if you want to run it in detached mode). 

Now you'll have: 

- a full arweave node running on [http://localhost:1984](http://localhost:1984). Here you can access all the endpoints listed in this page: [https://docs.arweave.org/developers/server/http-api](https://docs.arweave.org/developers/server/http-api)
- a full arweave gateway running on [http://localhost:3000](http://localhost:3000) and an GraphQL playground running on [http://localhost:3000/graphql](http://localhost:3000/graphql). Here you can do all the amazing things graphql and arweave supplies together. You can find examples and tutorials here [https://gql-guide.vercel.app/](https://gql-guide.vercel.app/) 


So, now, [import the TestWeave SDK](https://github.com/ArweaveTeam/testweave-sdk) in your projects and HAPPY TESTDLING ! 🖖🌋🚀 

<!-- ## Build and publish the Docker

1. Clone this repo
2. Merge everything but the .env file from here: [https://github.com/ArweaveTeam/gateway](https://github.com/ArweaveTeam/gateway)
3. Run a `docker-compose build`
4. Run a `docker-compose up`
5. Verify that everything works on your local environment. So, after having done 3. and 4. you should verify the followings: 
   1. Clone the TestWeave SDK repository [https://github.com/ArweaveTeam/testweave-sdk](https://github.com/ArweaveTeam/testweave-sdk);
   2. Go inside the TestWeave SDK dir, and run a `npm install` and then a `npm run test`;
   3. Now you should have some TXs inside your arweave-node;
   4. Go to https://localhost:3000/TXID that should display something like: "Arweave is the best web3-related thing out there!!!"
   5. Check out that the arweave-node works too. Navigate to http://localhost:1984/tx/TXID that should display the JSON info about the transaction
   6. If 4. and 5. above work, then the docker built and run properly
6. Stop the docker container by running `docker-compose down` or by presing ctrl+c
7. Run `docker images` and sign down the ID of the image having the name: "testweave-docker_gateway"
8. If you are not logged in docker, do it by running `docker login −−username=<USERNAME> −−email=<EMAIL ID>`
9. Assign to that image a tag that is relevant to your docker user and that increments the latest version you have published of the image. For instance, since my username is "lucaarweave", since the last version I have published was the "0.0.1", and since my image ID is "e61546b17694" I have to run: `docker tag e61546b17694 lucaarweave/testweave-docker:0.0.2`
10. Publish the docker on docker-hub by running `docker push <user−name>/image−name`. For instance, for the example in 9. yous should run `docker push lucaarweave/testweave-docker:0.0.2`
11. To verify that everything worked properly: 
    1.  firstly clean your docker local system by running: `docker system prune` and `docker volume prune`
    2.  pull the image that you have published in 10. by running `docker pull <user−name>/image−name`. For instance, for the example in 9. you should run `docker pull lucaarweave/testweave-docker:0.0.2`
    3.  After the image is downloaded run `docker run <user−name>/image−name`, for instance -->
