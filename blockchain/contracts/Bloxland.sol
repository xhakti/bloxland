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
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Bloxland is EIP712 {
  using SignatureChecker for address;
  using ECDSA for bytes32;

  struct Game {
    bool random;
  }

  struct Play {
    // Which game to play
    uint256 gameId;

    // Who is playing
    address player;

    // Number of tokens to consume
    uint256 energyAmount;

    // Given by the user
    int64 answer;

    // 0 no result yet
    // 1 positive result
    // -1 negative result
    int8 result;
  }

  uint256 public constant GAME_RANDOM_DICE = 1;
  uint256 public constant GAME_RANDOM_EVEN = 2;
  uint256 public constant GAME_RANDOM_OVER = 3;

  uint256 public constant GAME_BTC_GT = 5;

  IPyth pyth;
  IEntropyV2 private entropy;
  address private entropyProvider;

  address private signer;

  EnergyToken public energyToken;

  mapping(uint256 => Game) public games;

  mapping(uint256 => Play) public plays;

  uint256 private _nextSequenceNumber = 1;

  constructor(
    address _oracle,
    address _entropy,
    address _entropyProvider,
    address _signer,
    address _energy
  ) EIP712("BloxlandPlay", "1") {
    pyth = IPyth(_oracle);
    entropy = IEntropyV2(_entropy);
    entropyProvider = _entropyProvider;

    signer = _signer;

    energyToken = EnergyToken(_energy);

    Game memory diceGuess = Game(true);

    Game memory evenGuess = Game(true);

    Game memory overGuess = Game(true);

    Game memory btcGtGuess = Game(false);

    games[GAME_RANDOM_DICE] = diceGuess;

    games[GAME_RANDOM_EVEN] = evenGuess;

    games[GAME_RANDOM_OVER] = overGuess;

    games[GAME_BTC_GT] = btcGtGuess;
  }

  function play(uint256 _gameId, uint256 _energyAmount) public returns (uint256) {
    // TODO burn _energyAmount

    Game memory theGame = games[_gameId];
    Play memory thePlay = Play(_gameId, msg.sender, _energyAmount, 0, 0);

    if (theGame.random) {
      // Contract needs ETH to pay for random
      uint256 fee = entropy.getFeeV2();

      // Use the given random sequency number as play id
      uint64 sequenceNumber = entropy.requestV2{value: fee}();

      plays[sequenceNumber] = thePlay;
      return sequenceNumber;
    } else {
      // pick a number after uint64 so it doesn't
      // overlaps with sequenceNumber
      uint256 thePlayId = 18446744073709551615 + _nextSequenceNumber;
      _nextSequenceNumber++;

      plays[thePlayId] = thePlay;
      return thePlayId;
    }
  }

  function answer(uint256 _playId, int64 _answer) public {
    Play memory thePlay = plays[_playId];
    Game memory theGame = games[thePlay.gameId];

    if (theGame.random) {
      plays[_playId].answer = _answer;
    } else {
      // https://docs.pyth.network/price-feeds/price-feeds
      PythStructs.Price memory currentBasePrice = pyth.getPriceUnsafe(
        0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43
      );

      if (thePlay.gameId == GAME_BTC_GT) {
        if (currentBasePrice.price > _answer) {
          plays[_playId].result = 1;
        } else {
          plays[_playId].result = -1;
        }
      } else {
        revert("Game not found");
      }
    }
  }

  function entropyCallback(
    uint64 sequenceNumber,
    address,
    bytes32 randomNumber
  ) internal {
    Play memory thePlay = plays[sequenceNumber];
    Game memory theGame = games[thePlay.gameId];

    if (!theGame.random) {
      revert("Cannot process random number for not random game");
    }

    if (thePlay.gameId == GAME_RANDOM_DICE) {
      int256 diceValue = _mapRandomNumber(randomNumber, 1, 6);

      if (diceValue == thePlay.answer) {
        plays[sequenceNumber].result = 1;
      } else {
        plays[sequenceNumber].result = -1;
      }
    } else if (thePlay.gameId == GAME_RANDOM_EVEN) {
      int256 randomValue = _mapRandomNumber(randomNumber, 1, 100);

      if (randomValue % 2 == 0) {
        if (thePlay.answer == 1) {
          plays[sequenceNumber].result = 1;
        } else {
          plays[sequenceNumber].result = -1;
        }
      } else {
        if (thePlay.answer == 1) {
          plays[sequenceNumber].result = -1;
        } else {
          plays[sequenceNumber].result = 1;
        }
      }
    } else if (thePlay.gameId == GAME_RANDOM_OVER) {
      int256 randomValue = _mapRandomNumber(randomNumber, 1, 100);

      if (randomValue > 50) {
        if (thePlay.answer == 1) {
          plays[sequenceNumber].result = 1;
        } else {
          plays[sequenceNumber].result = -1;
        }
      } else {
        if (thePlay.answer == 1) {
          plays[sequenceNumber].result = -1;
        } else {
          plays[sequenceNumber].result = 1;
        }
      }
    } else {
      revert("Game not found");
    }
  }

  function answerWithSignature(
    uint256 _playId,
    int64 _answer,
    int8 _result,
    bytes memory _signature
  ) public {
    if (!SignatureChecker.isValidSignatureNow(signer, _hash(_playId, msg.sender, _answer), _signature)) {
      revert("Invalid signature");
    }
    if (_result != -1 || _result != 1) {
      revert("Invalid result");
    }
    plays[_playId].result = _result;
  }

  function _hash(uint256 _playId, address _player, int64 _answer) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("BloxlandPlay(uint256 playId,address player,int64 answer)"),
      _playId,
      _player,
      _answer
    )));
  }

  function _mapRandomNumber(bytes32 randomNumber, int256 minRange, int256 maxRange) pure internal returns (int256) {
    uint256 range = uint256(maxRange - minRange + 1);
    return minRange + int256(uint256(randomNumber) % range);
  }

  receive() external payable {}
}
