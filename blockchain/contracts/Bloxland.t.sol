// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Bloxland} from "./Bloxland.sol";
import {Test} from "forge-std/Test.sol";

contract BloxlandTest is Test {
  Bloxland bloxland;

  function setUp() public {
    bloxland = new Bloxland();
  }
}
