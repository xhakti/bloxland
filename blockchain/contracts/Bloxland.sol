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

contract Bloxland is EIP712, IEntropyConsumer {
  using SignatureChecker for address;
  using ECDSA for bytes32;

  event PlayStarted(uint256 playId);
  event PlayEnded(uint256 playId, int8 result);

  struct Game {
    // Name of the game
    string name;

    // Games with entropy are true
    bool random;
  }

  struct Play {
    // Which game to play
    uint256 gameId;

    // Who is playing
    address player;

    // Number of tokens to consume
    uint256 energyAmount;

    // Given by the entropy
    bytes32 randomNumber;

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

  address private signer;

  EnergyToken private energyToken;

  mapping(uint256 => Game) public games;

  mapping(uint256 => Play) public plays;

  uint256 private _nextSequenceNumber = 1;

  constructor(
    address _oracle,
    address _entropy,
    address _signer,
    address _energy
  ) EIP712("BloxlandPlay", "1") {
    pyth = IPyth(_oracle);

    entropy = IEntropyV2(_entropy);

    signer = _signer;

    energyToken = EnergyToken(_energy);

    Game memory diceGuess = Game("Dice Guess", true);

    Game memory evenGuess = Game("Even Number Guess", true);

    Game memory overGuess = Game("Upper Half Guess", true);

    Game memory btcGtGuess = Game("BTC Price Guess", false);

    games[GAME_RANDOM_DICE] = diceGuess;

    games[GAME_RANDOM_EVEN] = evenGuess;

    games[GAME_RANDOM_OVER] = overGuess;

    games[GAME_BTC_GT] = btcGtGuess;
  }

  function play(uint256 _gameId, uint256 _energyAmount) public returns (uint256) {
    if (energyToken.balanceOf(msg.sender) < _energyAmount) {
      revert("Not enough energy");
    }

    energyToken.consume(msg.sender, _energyAmount);

    Play memory thePlay = Play(_gameId, msg.sender, _energyAmount, bytes32(''), 0);
    Game memory theGame = games[_gameId];

    if (bytes(theGame.name).length == 0) {
      revert("Game not found");
    }

    if (theGame.random) {
      uint32 gasLimit = 5000000;

      // Contract needs ETH to pay for random
      uint256 fee = entropy.getFeeV2(gasLimit);

      // Use the given random sequency number as play id
      uint64 sequenceNumber = entropy.requestV2{value: fee}(gasLimit);

      plays[sequenceNumber] = thePlay;

      emit PlayStarted(sequenceNumber);

      return uint256(sequenceNumber);
    } else {
      // pick a number after uint64 so it doesn't
      // overlaps with sequenceNumber
      uint256 thePlayId = 18446744073709551615 + _nextSequenceNumber;
      _nextSequenceNumber++;

      plays[thePlayId] = thePlay;

      emit PlayStarted(thePlayId);

      return thePlayId;
    }
  }

  function answer(uint256 _playId, int64 _answer) public {
    if (_answer == 0) {
      revert("Invalid answer");
    }

    Play memory thePlay = plays[_playId];

    if (thePlay.player == address(0)) {
      revert("Play not found");
    }

    Game memory theGame = games[thePlay.gameId];

    if (bytes(theGame.name).length == 0) {
      revert("Game not found");
    }

    if (theGame.random) {
      if (plays[_playId].randomNumber == bytes32('')) {
        revert("Wait until random number");
      }

      _gameEntropy(thePlay, uint64(_playId), plays[_playId].randomNumber, _answer);
    } else {
      _gameOracle(thePlay, _playId, _answer);
    }
  }

  function entropyCallback(
    uint64 sequenceNumber,
    address,
    bytes32 randomNumber
  ) internal override {
    // Play memory thePlay = plays[sequenceNumber];

    // if (thePlay.player == address(0)) {
    //   revert("Play not found");
    // }

    // Game memory theGame = games[thePlay.gameId];

    // if (bytes(theGame.name).length == 0) {
    //   revert("Game not found");
    // }

    // if (!theGame.random) {
    //   revert("Cannot process random number for not random game");
    // }

    plays[sequenceNumber].randomNumber = randomNumber;
  }

  function answerWithSignature(
    uint256 _playId,
    int64 _answer,
    int8 _result,
    bytes memory _signature
  ) public {
    if (plays[_playId].player == address(0)) {
      revert("Play not found");
    }

    if (_answer == 0) {
      revert("Invalid answer");
    }

    if (_result != -1 && _result != 1) {
      revert("Invalid result");
    }

    if (!SignatureChecker.isValidSignatureNow(signer, _hash(_playId, msg.sender, _answer), _signature)) {
      revert("Invalid signature");
    }

    plays[_playId].result = _result;
    emit PlayEnded(_playId, _result);
  }

  function _hash(uint256 _playId, address _player, int64 _answer) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("BloxlandPlay(uint256 playId,address player,int64 answer)"),
      _playId,
      _player,
      _answer
    )));
  }

  function _gameEntropy(
    Play memory thePlay,
    uint64 sequenceNumber,
    bytes32 randomNumber,
    int64 _answer
  ) private {
    if (thePlay.gameId == GAME_RANDOM_DICE) {
      int256 diceValue = _mapRandomNumber(randomNumber, 1, 6);

      if (diceValue == _answer) {
        plays[sequenceNumber].result = 1;
        emit PlayEnded(sequenceNumber, 1);
      } else {
        plays[sequenceNumber].result = -1;
        emit PlayEnded(sequenceNumber, -1);
      }
    } else if (thePlay.gameId == GAME_RANDOM_EVEN) {
      int256 randomValue = _mapRandomNumber(randomNumber, 1, 100);

      if (randomValue % 2 == 0) {
        if (_answer == 1) {
          plays[sequenceNumber].result = 1;
          emit PlayEnded(sequenceNumber, 1);
        } else {
          plays[sequenceNumber].result = -1;
          emit PlayEnded(sequenceNumber, -1);
        }
      } else {
        if (_answer == 1) {
          plays[sequenceNumber].result = -1;
          emit PlayEnded(sequenceNumber, -1);
        } else {
          plays[sequenceNumber].result = 1;
          emit PlayEnded(sequenceNumber, 1);
        }
      }
    } else if (thePlay.gameId == GAME_RANDOM_OVER) {
      int256 randomValue = _mapRandomNumber(randomNumber, 1, 100);

      if (randomValue > 50) {
        if (_answer == 1) {
          plays[sequenceNumber].result = 1;
          emit PlayEnded(sequenceNumber, 1);
        } else {
          plays[sequenceNumber].result = -1;
          emit PlayEnded(sequenceNumber, -1);
        }
      } else {
        if (_answer == 1) {
          plays[sequenceNumber].result = -1;
          emit PlayEnded(sequenceNumber, -1);
        } else {
          plays[sequenceNumber].result = 1;
          emit PlayEnded(sequenceNumber, 1);
        }
      }
    } else {
      revert("Game not found");
    }
  }

  function _gameOracle(Play memory thePlay, uint256 _playId, int64 _answer) private {
    // https://docs.pyth.network/price-feeds/price-feeds
    PythStructs.Price memory btc = pyth.getPriceNoOlderThan(
      0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43,
      60
    );

    if (thePlay.gameId == GAME_BTC_GT) {
      if (btc.price > _answer) {
        plays[_playId].result = 1;
        emit PlayEnded(_playId, 1);
      } else {
        plays[_playId].result = -1;
        emit PlayEnded(_playId, -1);
      }
    } else {
      revert("Game not found");
    }
  }

  function _mapRandomNumber(bytes32 randomNumber, int256 minRange, int256 maxRange) pure internal returns (int256) {
    uint256 range = uint256(maxRange - minRange + 1);
    return minRange + int256(uint256(randomNumber) % range);
  }

  function getEntropy() internal view override returns (address) {
    return address(entropy);
  }

  receive() external payable {}
}
