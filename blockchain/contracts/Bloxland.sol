// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./EnergyToken.sol";

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import "@pythnetwork/entropy-sdk-solidity/EntropyStructsV2.sol";

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract Bloxland {
  using SignatureChecker for address;

  struct Game {
    bool random;
  }

  struct Play {
    uint256 gameId;
    uint256 energyAmount;
    uint256 answer;
  }

  uint256 public constant GAME_RANDOM_DICE = 1;
  uint256 public constant GAME_RANDOM_EVEN = 2;

  uint256 public constant GAME_BTC_GT = 5;

  IPyth pyth;
  IEntropyV2 private entropy;
  address private entropyProvider;

  address private signer;

  EnergyToken public energyToken;

  mapping(uint256 => Game) public games;

  mapping(uint256 => Play) public plays;

  mapping(uint256 => bool) public results;

  uint256 nextResultId = 1;

  constructor(
    address _oracle,
    address _entropy,
    address _entropyProvider,
    address _signer,
    address _energy
  ) {
    pyth = IPyth(_oracle);
    entropy = IEntropyV2(_entropy);
    entropyProvider = _entropyProvider;

    signer = _signer;

    energyToken = EnergyToken(_energy);

    Game memory diceGuess = Game(true);

    Game memory evenGuess = Game(true);

    Game memory btcGtGuess = Game(false);

    games[GAME_RANDOM_DICE] = diceGuess;

    games[GAME_RANDOM_EVEN] = evenGuess;

    games[GAME_BTC_GT] = btcGtGuess;
  }

  function play(uint256 _gameId, uint256 _energyAmount) public returns (uint256) {
    // TODO burn _energyAmount

    Game memory theGame = games[_gameId];
    Play memory thePlay = Play(_gameId, _energyAmount, 0);

    if (theGame.random) {
      uint256 fee = entropy.getFeeV2();
      uint64 sequenceNumber = entropy.requestV2{value: fee}();
      plays[sequenceNumber] = thePlay;
      return sequenceNumber;
    } else {
      // TODO pick a number after uint64 so it doesn't
      // overlaps with sequenceNumber
      uint256 thePlayId = 0;

      plays[thePlayId] = thePlay;
      return thePlayId;
    }
  }

  function answer(uint256 _playId, uint256 _answer) public returns (uint256) {
    Play memory thePlay = plays[_playId];
    Game memory theGame = games[thePlay.gameId];

    if (theGame.random) {
      uint256 theResultId = nextResultId;

      Play memory newPlay = Play(thePlay.gameId, thePlay.energyAmount, _answer);

      plays[_playId] = newPlay;

      nextResultId++;

      return theResultId;
    }

    // https://docs.pyth.network/price-feeds/price-feeds
    PythStructs.Price memory currentBasePrice = pyth.getPrice(
      0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
    );

    if (thePlay.gameId == GAME_BTC_GT) {
      uint256 theResultId = nextResultId;

      if (currentBasePrice > _answer) {
        results[theResultId] = true;
      } else {
        results[theResultId] = false;
      }

      nextResultId++;

      return theResultId;
    } else {
      revert;
    }
  }

  function entropyCallback(
    uint64 sequenceNumber,
    address,
    bytes32 randomNumber
  ) internal override {
    Play memory thePlay = plays[sequenceNumber];
    Game memory theGame = games[thePlay.gameId];

    if (!theGame.random) {
      revert;
    }

    if (thePlay.gameId == GAME_RANDOM_DICE) {
      int256 diceValue = _mapRandomNumber(randomNumber, 1, 6);

      if (diceValue == thePlay.answer) {
      }
    }
  }

  function answerWithSignature(uint256 _playId, uint256 _answer, bytes memory _signature) public returns (bool) {
    if (!SignatureChecker.isValidSignatureNow(signer, _hash(_playId, _answer), _signature)) {
      revert;
    }
  }

  function _hash(uint256 _playId, bool _answer) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("Answer(uint256 playId,uint256 answer)"),
      keccak256(bytes(_playId)),
      keccak256(bytes(_answer))
    )));
  }

  function _mapRandomNumber(bytes32 randomNumber, int256 minRange, int256 maxRange) internal returns (int256) {
    uint256 range = uint256(maxRange - minRange + 1);
    return minRange + int256(uint256(randomNumber) % range);
  }

  receive() external payable {}
}
