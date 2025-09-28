// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";


/// @title Bloxland Subname Registrar
/// @notice Allows users to register subdomains under a parent ENS name (bloxland.eth) in a trustless, wrapped ENS setup.

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
    bytes32 public parentNode; // namehash of bloxland.eth
    uint32 public defaultFuses;
    uint64 public defaultExpiry;

    /// @notice Emitted when a subname is successfully registered
    event SubnameRegistered(
        address indexed gameContract,
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

    /// @notice Register a subdomain under the parent ENS name
    /// @param label The subdomain label (e.g., "game1")
    /// @param gameAddress The address of the game contract that will own the subdomain
    function registerSubname(string calldata label, address gameAddress) external {
        require(gameAddress != address(0), "Invalid game address");
        _registerSubname(label, gameAddress);
    }


    /// @notice Internal function to handle subname registration
    /// @param label The subdomain label
    /// @param subdomainOwner The address that will own the subdomain
    function _registerSubname(string calldata label, address subdomainOwner) internal {
        // Step 1: Temporarily own the subname for resolver setup
        nameWrapper.setSubnodeOwner(parentNode, label, address(this), defaultFuses, defaultExpiry);

        bytes32 node = namehash(string(abi.encodePacked(label, ".blocxland.eth")));

        // Step 2: Transfer ownership to the specified owner with final fuses and expiry
        nameWrapper.setSubnodeRecord(
            parentNode,
            label,
            subdomainOwner, // ✅ Now correctly assigns to the specified address
            resolver,
            0, // TTL
            defaultFuses,
            defaultExpiry
        );

        emit SubnameRegistered(subdomainOwner, label, node, defaultExpiry);
    }

    /// @notice Compute ENS namehash from a full name
    function namehash(string memory _name) public pure returns (bytes32 node) {
        node = 0x0;
        string[] memory labels = split(_name, ".");
        for (uint i = labels.length; i > 0; i--) {
            node = keccak256(abi.encodePacked(node, keccak256(bytes(labels[i - 1]))));
        }
    }

    /// @notice Split a string by a separator
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

    /// @notice Update default fuses and expiry (admin only)
    function updateDefaults(uint32 _fuses, uint64 _expiry) external onlyOwner {
        defaultFuses = _fuses;
        defaultExpiry = _expiry;
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    /// @notice Emergency function to recover ownership of subnames if needed
    function recoverSubname(string calldata label) external onlyOwner {
        nameWrapper.setSubnodeOwner(parentNode, label, owner, defaultFuses, defaultExpiry);
    }

    /// @notice Get the node hash for a given label
    function getNodeHash(string calldata label) external pure returns (bytes32) {
        return namehash(string(abi.encodePacked(label, "blocxland.eth")));
    }

    /// @notice Check if a label is valid (basic validation)
    function isValidLabel(string calldata label) external pure returns (bool) {
        bytes memory labelBytes = bytes(label);
        
        // Check length (1-63 characters for DNS labels)
        if (labelBytes.length == 0 || labelBytes.length > 63) {
            return false;
        }
        
        // Check for valid characters (alphanumeric and hyphens, not starting/ending with hyphen)
        if (labelBytes[0] == 0x2d || labelBytes[labelBytes.length - 1] == 0x2d) { // hyphen
            return false;
        }
        
        for (uint i = 0; i < labelBytes.length; i++) {
            bytes1 char = labelBytes[i];
            // Allow a-z, A-Z, 0-9, and hyphen
            if (!(
                (char >= 0x61 && char <= 0x7a) || // a-z
                (char >= 0x41 && char <= 0x5a) || // A-Z
                (char >= 0x30 && char <= 0x39) || // 0-9
                char == 0x2d                      // hyphen
            )) {
                return false;
            }
        }
        
        return true;
    }
}