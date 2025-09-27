// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Bloxland Subname Registrar
/// @notice Allows users to register subdomains under a parent ENS name (bloxland.eth) in a trustless, wrapped ENS setup.

interface IResolver {
    function setContenthash(bytes32 node, bytes calldata hash) external;
}

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

contract BloxlandSubnameRegistrar {
    INameWrapper public nameWrapper;
    IResolver public resolver;
    address public owner;
    bytes32 public parentNode; // namehash of bloxland.eth
    uint32 public defaultFuses;
    uint64 public defaultExpiry;

    /// @notice Emitted when a subname is successfully registered
    event SubnameRegistered(
        address indexed user,
        string label,
        bytes32 indexed node,
        uint64 expiry
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call");
        _;
    }

    /// @param _nameWrapper Address of the ENS NameWrapper contract
    /// @param _resolver Address of the resolver to set contenthash
    /// @param _parentNode Namehash of the parent ENS name (e.g., bloxland.eth)
    /// @param _defaultFuses Default fuses to burn on registration
    /// @param _defaultExpiry Default expiry timestamp for subdomains
    constructor(
        address _nameWrapper,
        address _resolver,
        bytes32 _parentNode,
        uint32 _defaultFuses,
        uint64 _defaultExpiry
    ) {
        nameWrapper = INameWrapper(_nameWrapper);
        resolver = IResolver(_resolver);
        owner = msg.sender;
        parentNode = _parentNode;
        defaultFuses = _defaultFuses;
        defaultExpiry = _defaultExpiry;
    }

    /// @notice Register a subdomain under the parent ENS name
    /// @param label The subdomain label (e.g., "game1")
    /// @param contentHash IPFS/Arweave contenthash for this subdomain
    function registerSubname(string calldata label, bytes calldata contentHash) external {
        // Step 1: Temporarily own the subname for resolver setup
        nameWrapper.setSubnodeOwner(parentNode, label, address(this), defaultFuses, defaultExpiry);

        bytes32 node = namehash(string(abi.encodePacked(label, ".blockxland.eth")));

        // Step 2: Set resolver contenthash
        resolver.setContenthash(node, contentHash);

        // Step 3: Transfer ownership to the caller with final fuses and expiry
        nameWrapper.setSubnodeRecord(
            parentNode,
            label,
            msg.sender,
            address(resolver),
            0, // TTL
            defaultFuses,
            defaultExpiry
        );

        emit SubnameRegistered(msg.sender, label, node, defaultExpiry);
    }

    /// @notice Compute ENS namehash from a full name
    function namehash(string memory _name) public pure returns (bytes32 node) {
        node = 0x0;
        string[] memory labels = split(_name, '.');
        for (uint i = labels.length; i > 0; i--) {
            node = keccak256(abi.encodePacked(node, keccak256(bytes(labels[i - 1]))));
        }
    }

    /// @notice Split a string by a separator
    function split(string memory _base, string memory _sep) internal pure returns (string[] memory parts) {
        bytes memory baseBytes = bytes(_base);
        uint count = 1;
        for (uint i = 0; i < baseBytes.length; i++) {
            if (baseBytes[i] == bytes(_sep)[0]) count++;
        }

        parts = new string[](count);
        uint partIndex = 0;
        bytes memory buffer;

        for (uint i = 0; i < baseBytes.length; i++) {
            if (baseBytes[i] != bytes(_sep)[0]) {
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
}
