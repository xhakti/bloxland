export const BloxLand_CONTRACT_ADDRESS =
  "0xD3d9C446F30347E3c09bd6A219012037951c30b1";
export const BloxLand_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_oracle", type: "address" },
      { internalType: "address", name: "_entropy", type: "address" },
      { internalType: "address", name: "_signer", type: "address" },
      { internalType: "address", name: "_energy", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "InvalidShortString", type: "error" },
  {
    inputs: [{ internalType: "string", name: "str", type: "string" }],
    name: "StringTooLong",
    type: "error",
  },
  { anonymous: false, inputs: [], name: "EIP712DomainChanged", type: "event" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "playId",
        type: "uint256",
      },
      { indexed: false, internalType: "int8", name: "result", type: "int8" },
    ],
    name: "PlayEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "playId",
        type: "uint256",
      },
    ],
    name: "PlayStarted",
    type: "event",
  },
  {
    inputs: [],
    name: "GAME_BTC_GT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAME_RANDOM_DICE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAME_RANDOM_EVEN",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "GAME_RANDOM_OVER",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_playId", type: "uint256" },
      { internalType: "int64", name: "_answer", type: "int64" },
    ],
    name: "answer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_playId", type: "uint256" },
      { internalType: "int64", name: "_answer", type: "int64" },
      { internalType: "int8", name: "_result", type: "int8" },
      { internalType: "bytes", name: "_signature", type: "bytes" },
    ],
    name: "answerWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { internalType: "bytes1", name: "fields", type: "bytes1" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "version", type: "string" },
      { internalType: "uint256", name: "chainId", type: "uint256" },
      { internalType: "address", name: "verifyingContract", type: "address" },
      { internalType: "bytes32", name: "salt", type: "bytes32" },
      { internalType: "uint256[]", name: "extensions", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "games",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bool", name: "random", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_gameId", type: "uint256" },
      { internalType: "uint256", name: "_energyAmount", type: "uint256" },
    ],
    name: "play",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "plays",
    outputs: [
      { internalType: "uint256", name: "gameId", type: "uint256" },
      { internalType: "address", name: "player", type: "address" },
      { internalType: "uint256", name: "energyAmount", type: "uint256" },
      { internalType: "bytes32", name: "randomNumber", type: "bytes32" },
      { internalType: "int8", name: "result", type: "int8" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
];
