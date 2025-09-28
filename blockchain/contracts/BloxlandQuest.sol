// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BloxlandQuest is Ownable {
  string public name;
  IERC20 public token;
  uint256 public rewards;
  uint256 public winners;
  address[] public participants;
  bool public completed;

  constructor(
    address _owner,
    string memory _name,
    address _token,
    uint256 _rewards,
    uint256 _winners
  ) Ownable(_owner) {
    if (winners == 0) {
      revert("No winners");
    }

    if (rewards < winners) {
      revert("No enough rewards");
    }

    if (rewards % winners != 0) {
      revert("Rewards not equal");
    }

    name = _name;
    token = IERC20(_token);
    rewards = _rewards;
    winners = _winners;
  }

  function participate() public {
    if (participants.length >= winners) {
      revert("Quest full");
    }

    participants.push(msg.sender);
  }

  function complete(address[] calldata _winners) public onlyOwner {
    if (completed) {
      revert("Already completed");
    }

    if (_winners.length != winners) {
      revert("No enough winners");
    }

    uint256 rewardPerWinner = rewards / winners;

    for (uint256 i = 0; i < winners; i++) {
      token.transfer(_winners[i], rewardPerWinner);
    }

    completed = true;
  }
}
