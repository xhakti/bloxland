import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BloxlandModule", (m) => {
  const bloxland = m.contract("Bloxland");

  return { bloxland };
});
