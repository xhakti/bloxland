# Bloxland

Walk. Discover. Collect.

## Contract Mini-Games

Based on `blockchain/contracts/Bloxland.sol`:

- Dice Guess (random)
  - ID: `GAME_RANDOM_DICE`
  - Answer: int64 in [1..6] representing your dice guess
  - Outcome: 1 if random dice equals your answer; otherwise -1

- Even Number Guess (random)
  - ID: `GAME_RANDOM_EVEN`
  - Answer: 1 for "even", any other non-zero treated as "odd"
  - Outcome: 1 if random number (1..100) parity matches your answer; otherwise -1

- Upper Half Guess (random)
  - ID: `GAME_RANDOM_OVER`
  - Answer: 1 for "> 50", any other non-zero means "<= 50"
  - Outcome: 1 if random number (1..100) is > 50 and you answered 1; else -1 (and vice versa)

- BTC Price Guess (oracle)
  - ID: `GAME_BTC_GT`
  - Answer: int64 threshold price; outcome is 1 if current price > answer else -1

Each `play(gameId, energyAmount)` consumes ENERGY and emits `PlayStarted(playId)`. For random games, `playId` is the entropy sequence number; for non-random, a large monotonic id is used.

## Answering

- Random games: call `answer(playId, answer)` before randomness fulfillment; final result is decided in `entropyCallback`.
- Non-random BTC game: `answer(playId, answer)` immediately evaluates using Pyth price and emits `PlayEnded`.
- Off-chain: `answerWithSignature(playId, answer, result, signature)` validates a backend EIP-712 signature over `BloxlandPlay(uint256 playId,address player,int64 answer)`.

## Energize Flow

- Backend signs `BloxlandEnergize(address player,uint256 _amount)` per EIP-712 (`EnergyToken.sol`).
- Frontend calls `energizeWithSignature(amount, signature)` to mint ENERGY to the caller.


