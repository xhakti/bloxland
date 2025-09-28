// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BloxlandQuest} from "./BloxlandQuest.sol";
import {BloxlandSubnameRegistrar} from "./BloxlandENS.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BloxlandQuests {
  BloxlandSubnameRegistrar private bloxlandENS;

  mapping(bytes32 => address) public quests;

  constructor(address _bloxlandENS) {
    bloxlandENS = BloxlandSubnameRegistrar(_bloxlandENS);
  }

  function registerQuest(
    bytes32 _id,
    string calldata _label,
    address _token,
    uint256 _rewards,
    uint256 _winners
  ) public {
    BloxlandQuest quest = new BloxlandQuest(
      msg.sender,
      _label,
      _token,
      _rewards,
      _winners
    );

    IERC20(_token).transferFrom(msg.sender, address(quest), _rewards);

    // FIXME pass address(quest) as owner of the subname
    bloxlandENS.registerSubname(_label, address(quest));

    quests[_id] = address(quest);
  }
}
