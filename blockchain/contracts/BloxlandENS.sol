// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

interface INameWrapper {
    function setSubnodeOwner(
        bytes32 parentNode,
        string calldata label,
        address owner,
        uint32 fuses,
        uint64 expiry
    ) external;

    function setSubnodeRecord(
        bytes32 parentNode,
        string calldata label,
        address owner,
        address resolver,
        uint64 ttl,
        uint32 fuses,
        uint64 expiry
    ) external;
}

contract BloxlandSubnameRegistrar is ERC1155Holder {
    INameWrapper public nameWrapper;
    address public resolver;
    address public owner;
    bytes32 public parentNode;
    uint32 public defaultFuses;
    uint64 public defaultExpiry;

    event SubnameRegistered(
        address indexed subdomainOwner,
        string label,
        bytes32 indexed node,
        uint64 expiry
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    constructor(
        address _nameWrapper,
        address _resolver,
        bytes32 _parentNode,
        uint32 _defaultFuses,
        uint64 _defaultExpiry
    ) {
        nameWrapper = INameWrapper(_nameWrapper);
        resolver = _resolver;
        owner = msg.sender;
        parentNode = _parentNode;
        defaultFuses = _defaultFuses;
        defaultExpiry = _defaultExpiry;
    }

    function registerSubname(string calldata label, address userAddress) external {
        require(userAddress != address(0), "Invalid address");
        require(_isValidLabel(label), "Invalid label format");
        _registerSubname(label, userAddress);
    }

    function _registerSubname(string calldata label, address subdomainOwner) internal {
        nameWrapper.setSubnodeOwner(parentNode, label, address(this), defaultFuses, defaultExpiry);
        
        // Fixed: Use correct domain name in namehash
        bytes32 node = namehash(string(abi.encodePacked(label, ".blockxland.eth")));


        nameWrapper.setSubnodeRecord(
            parentNode,
            label,
            subdomainOwner,
            resolver,
            0,
            defaultFuses,
            defaultExpiry
        );

        emit SubnameRegistered(subdomainOwner, label, node, defaultExpiry);
    }

    function namehash(string memory _name) public pure returns (bytes32 node) {
        node = 0x0;
        string[] memory labels = split(_name, ".");
        for (uint i = labels.length; i > 0; i--) {
            node = keccak256(abi.encodePacked(node, keccak256(bytes(labels[i - 1]))));
        }
    }

    function split(string memory _base, string memory _sep) internal pure returns (string[] memory parts) {
        bytes memory baseBytes = bytes(_base);
        bytes1 sepByte = bytes(_sep)[0];
        uint count = 1;
        
        for (uint i = 0; i < baseBytes.length; i++) {
            if (baseBytes[i] == sepByte) count++;
        }

        parts = new string[](count);
        uint partIndex = 0;
        bytes memory buffer;

        for (uint i = 0; i < baseBytes.length; i++) {
            if (baseBytes[i] != sepByte) {
                buffer = abi.encodePacked(buffer, baseBytes[i]);
            } else {
                parts[partIndex++] = string(buffer);
                buffer = "";
            }
        }

        parts[partIndex] = string(buffer);
    }

    function updateDefaults(uint32 _fuses, uint64 _expiry) external onlyOwner {
        defaultFuses = _fuses;
        defaultExpiry = _expiry;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    function recoverSubname(string calldata label) external onlyOwner {
        nameWrapper.setSubnodeOwner(parentNode, label, owner, defaultFuses, defaultExpiry);
    }

    function getNodeHash(string calldata label) external pure returns (bytes32) {
    return namehash(string(abi.encodePacked(label, ".blockxland.eth")));
}

    function isValidLabel(string calldata label) external pure returns (bool) {
        return _isValidLabel(label);
    }

    function _isValidLabel(string memory label) internal pure returns (bool) {
        bytes memory labelBytes = bytes(label);
        
        if (labelBytes.length == 0 || labelBytes.length > 63) return false;
        if (labelBytes[0] == 0x2d || labelBytes[labelBytes.length - 1] == 0x2d) return false;

        for (uint i = 0; i < labelBytes.length; i++) {
            bytes1 char = labelBytes[i];
            if (!(
                (char >= 0x61 && char <= 0x7a) || 
                (char >= 0x41 && char <= 0x5a) || 
                (char >= 0x30 && char <= 0x39) || 
                char == 0x2d
            )) return false;
        }
        return true;
    }
}