import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BloxlandModule", (m) => {
  if (!process.env.SIGNER_ADDRESS) {
    throw new Error('Missing signer address');
  }

  const signerAddress = process.env.SIGNER_ADDRESS;

  const energyToken = m.contract("EnergyToken", [
    signerAddress, // address _signer
  ]);

  const bloxland = m.contract("Bloxland", [
    '0xA2aa501b19aff244D90cc15a4Cf739D2725B5729', // address _oracle
    '0x41c9e39574f40ad34c79f1c99b66a45efb830d4c', // address _entropy
    signerAddress, // address _signer
    energyToken, // address _energy
  ]);

  return { bloxland };
});
