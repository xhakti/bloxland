import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia, sepolia } from "@reown/appkit/networks";

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Set the networks (Sepolia first as default)
const networks = [baseSepolia, sepolia];

// 3. Create Wagmi Adapter with optimized settings
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false, // Disable SSR to prevent duplicate requests
});

// 4. Create modal with mobile-optimized settings
createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseSepolia, sepolia],
  projectId,
  defaultNetwork: baseSepolia, // Set Sepolia as default network
  metadata: {
    name: "Bloxland",
    description: "Walk. Discover. Collect. - A Web3 adventure game",
    url: "https://bloxland.app",
    icons: ["./logo.png"],
  },
  features: {
    analytics: true,
    connectMethodsOrder: ["wallet"],
    onramp: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-border-radius-master": "8px",
  },
  // Mobile-specific configurations
  enableWalletConnect: true,
  enableCoinbase: true,
  enableEIP6963: true,
  enableInjected: true,
});

export { wagmiAdapter };
