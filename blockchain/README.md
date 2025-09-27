# Bloxland Contracts

## Configuration

Copy `.env.template` to `.env` and replace the private key and the backend signer.

## Mini Games Contract

The `Bloxland` contract hold many mini-games to be played on-chain.

It uses Pyth Network to fetch external resources such an random numbers using
the entropy contract and the price of BTC using the oracle contract.

There are four games registered:

- Dice: guess a number from a randomly selected (using Pyth entropy) between
  one and six.
- Even or Odd: try to find out if a number between 1 and 100 that is random
  picked is divisible by two or not.
- Over Half: win when you found that a random number between 1 and 100 is
  greater than 50 or not.
- Greater than BTC Price: see how close you are of finding the BTC price (from
  the Pyth oracle).

The contract also supports off-chain deciding on winners of partner games using
EIP-712 signature standard.

### Deployment

```shell
pnpm exec hardhat --network base-sepolia ignition deploy ignition/modules/Bloxland.ts
```

## ENS Contract

A [subname registar](https://docs.ens.domains/wrapper/creating-subname-registrar)
has been developed as `BloxlandENS` contract.

### Deployment

```shell
pnpm exec hardhat --network sepolia ignition deploy ignition/modules/BloxlandSubnameRegistrar.ts
```

### Domain Registration

1. Go to https://sepolia.app.ens.domains and register `bloxland.eth`,
2. Wrap the domain in the "More" section from the manager app,
2. Deploy the contract `BloxlandENS`,
3. [Approve the deployed contract](https://docs.ens.domains/wrapper/creating-subname-registrar/#approve-your-contract)
   in the [name wrapper contract](https://sepolia.etherscan.io/address/0x0635513f179D50A207757E05759CbD106d7dFcE8#writeContract),
4. Lock the domain by removing `CANNOT_UNWRAP` in the "Permissions" section
   from the manager app.
