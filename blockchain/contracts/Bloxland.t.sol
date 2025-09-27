// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";

import {Bloxland} from "./Bloxland.sol";
import {EnergyToken} from "./EnergyToken.sol";

import {MockPyth} from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";

contract BloxlandTest is Test {
  MockPyth public pyth;

  EnergyToken public energyToken;

  Bloxland public bloxland;

  function setUp() public {
    pyth = new MockPyth(60, 1);

    energyToken = new EnergyToken();

    bloxland = new Bloxland(
      address(pyth),
      address(0),
      address(0),
      address(energyToken)
    );
  }

  function createBtcUpdate(int64 btcPrice) private view returns (bytes[] memory) {
    bytes[] memory updateData = new bytes[](1);

    updateData[0] = pyth.createPriceFeedUpdateData(
      0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43,
      btcPrice * 100000, // price
      10 * 100000, // confidence
      -5, // exponent
      btcPrice * 100000, // emaPrice
      10 * 100000, // emaConfidence
      uint64(block.timestamp), // publishTime
      uint64(block.timestamp) // prevPublishTime
    );

    return updateData;
  }

  function setBtcPrice(int64 btcPrice) private {
    bytes[] memory updateData = setBtcPrice(btcPrice);
    uint value = pyth.getUpdateFee(updateData);

    vm.deal(address(this), value);
    pyth.updatePriceFeeds{ value: value }(updateData);
  }

  function testPlay()
}
