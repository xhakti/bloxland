// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract PlayerSkins is ERC1155 {
  constructor() ERC1155("http://localhost:8080/skin/{id}.json") {}
}
