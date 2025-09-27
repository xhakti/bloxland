import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  polygon,
  optimism,
  base,
  sepolia,
} from "@reown/appkit/networks";

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Set the networks (Sepolia first as default)
const networks = [sepolia, mainnet, arbitrum, polygon, optimism, base];

// 3. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

// 4. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [sepolia],
  projectId,
  defaultNetwork: sepolia, // Set Sepolia as default network
  metadata: {
    name: "Bloxland",
    description: "Walk. Discover. Collect. - A Web3 adventure game",
    url: "https://bloxland.app", // origin must match your domain & subdomain
    icons: ["./logo.png"],
  },
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    connectMethodsOrder: ["wallet"], // Prioritize wallet connections
    onramp: false, // Disable onramp for testnet
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-border-radius-master": "8px",
  },
});

export { wagmiAdapter };
