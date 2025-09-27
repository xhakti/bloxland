import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BloxlandSubnameRegistrarModule", (m) => {
  // Make sure these are set in your .env file or passed in
  if (!process.env.NAME_WRAPPER) throw new Error("Missing NAME_WRAPPER address");
  if (!process.env.RESOLVER) throw new Error("Missing RESOLVER address");
  if (!process.env.PARENT_NODE) throw new Error("Missing PARENT_NODE (namehash of bloxland.eth)");

  // Convert environment variables
  const nameWrapper = m.getParameter("nameWrapper", process.env.NAME_WRAPPER);
  const resolver = m.getParameter("resolver", process.env.RESOLVER);
  const parentNode = m.getParameter("parentNode", process.env.PARENT_NODE);


  const registrar = m.contract("BloxlandSubnameRegistrar", [
    nameWrapper,
    resolver,
    parentNode,
    0,
    0,
  ]);

  return { registrar };
});
