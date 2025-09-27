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
