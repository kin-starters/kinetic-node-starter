# kinetic-airdrop-node

This starter shows how to implement a simple API that allows you to airdrop KIN to a Solana account using [Kinetic](https://github.com/kin-labs/kinetic).

In order to send the KIN, this API needs to have an Airdrop Account configured. Read the details in `.env.example` about how to create an Airdrop Account.

Make sure to protect your endpoints for malicious users, so they don't drain your Airdrop Account.

## Requirements

- Basic Node and TypeScript knowledge
- Node 16+
- Yarn 1.22.x

## Running this project

### 1. Clone the repo

```shell
git clone https://github.com/kin-starters/kinetic-airdrop-node.git
cd kinetic-airdrop-node
```

### 2. Install the dependencies

```shell
yarn install
```

### 3. Configure your environment

You need to create the `.env` file and configure the settings. All the env vars are required.

Read the `.env.example` file for configuration options.

```shell
// Or use your editor to copy the file...
cp .env.example .env
```

### 4. Run the server

```shell
yarn dev
```

### 5. Invoke the endpoint

You can now invoke the `/airdrop` endpoint on the API, adding the public key of the Solana destination account as a parameter:

```shell
curl http://localhost:7890/airdrop/FaFGzKRFhrQffH7voPUgzpJA2ngsvJvtYPXcye6w4DJ9
```

You can also add the amount of KIN to send as second parameter:

```shell
curl http://localhost:7890/airdrop/FaFGzKRFhrQffH7voPUgzpJA2ngsvJvtYPXcye6w4DJ9/1000
```
