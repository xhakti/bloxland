import "@nomicfoundation/hardhat-toolbox-viem";
import hre from "hardhat";

async function main() {
  // Cast to any to avoid TypeScript issues
  const viem = (hre as any).viem;
  const [deployer] = await viem.getWalletClients();

  console.log("🚀 Deploying with account:", deployer.account.address);

  // Actual deployed addresses
  const ENS_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e"; // ENS registry (mainnet)
  const RESOLVER_ADDRESS = "0x06Cd761C51248207cebbB45c289D8689DE61F30e"; // ENS public resolver
  const BLOXLAND_ADDRESS = "0x14Dfe8F2359ffF1fD8819cCD7cDb0f28Adf43e19"; // deployed Bloxland contract

  // --- DEPLOY CONTRACT ---
  const bloxlandENS = await viem.deployContract("BloxlandENS", [
    ENS_ADDRESS,
    RESOLVER_ADDRESS,
    BLOXLAND_ADDRESS
  ]);

  console.log("✅ BloxlandENS deployed to:", bloxlandENS.address);

  // --- SET ENS DOMAIN ---
  const publicClient = await viem.getPublicClient();
  const hash = await bloxlandENS.write.setENS(["bloxland.eth"]);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("🎉 ENS domain set for Bloxland!");
}
`0x{string}`

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});