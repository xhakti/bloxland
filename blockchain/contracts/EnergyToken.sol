// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EnergyToken is ERC20, EIP712, AccessControl {
  using SignatureChecker for address;
  using ECDSA for bytes32;

  bytes32 public constant BLOXLAND_ROLE = keccak256("BLOXLAND_ROLE");

  address private signer;

  constructor(address _signer) ERC20("Bloxland Energy", "ENERGY") EIP712("BloxlandEnergize", "1") {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

    signer = _signer;
  }

  function energizeWithSignature(uint256 _amount, bytes memory _signature) public {
    if (!SignatureChecker.isValidSignatureNow(signer, _hash(msg.sender, _amount), _signature)) {
      revert("Invalid signature");
    }

    _mint(msg.sender, _amount);
  }

  function _hash(address _player, uint256 _amount) internal view returns (bytes32) {
    return _hashTypedDataV4(keccak256(abi.encode(
      keccak256("BloxlandEnergize(address player,uint256 _amount)"),
      _player,
      _amount
    )));
  }

  function consume(address player, uint256 amount) public onlyRole(BLOXLAND_ROLE) {
    _burn(player, amount);
  }
}
