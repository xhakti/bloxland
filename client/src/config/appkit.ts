import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia, sepolia } from "@reown/appkit/networks";

// Guard: avoid re-initializing during Vite HMR or multiple imports
declare global {
  var __BLOXLAND_APPKIT_INITIALIZED__: boolean | undefined; // global guard flag
}

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

// 2. Set the networks (Sepolia first as default)
const networks = [baseSepolia, sepolia];

let wagmiAdapter: WagmiAdapter | null = null;

if (!projectId) {
  // Provide a clear runtime error (AppKit requires a valid project id)
  // This avoids silent failures when connecting wallets.
  // You can set VITE_REOWN_PROJECT_ID in your .env.local
  console.error("[AppKit] Missing VITE_REOWN_PROJECT_ID environment variable.");
} else if (!globalThis.__BLOXLAND_APPKIT_INITIALIZED__) {
  try {
    wagmiAdapter = new WagmiAdapter({
      networks,
      projectId,
      ssr: false,
    });

    createAppKit({
      adapters: [wagmiAdapter],
      networks: [baseSepolia, sepolia],
      projectId,
      defaultNetwork: baseSepolia,
      metadata: {
        name: "Bloxland",
        description: "Bloxland - Explore, Create & Earn in the Metaverse",
        url: "https://bloxland-client-production.up.railway.app",
        icons: ["https://bloxland-client-production.up.railway.app/logo.png"],
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
      enableWalletConnect: true,
      enableCoinbase: true,
      enableEIP6963: true,
      enableInjected: true,
    });
    globalThis.__BLOXLAND_APPKIT_INITIALIZED__ = true;
    // Helpful diagnostics
    console.log("[AppKit] Initialized successfully with projectId", projectId);
  } catch (err) {
    console.error("[AppKit] Initialization failed:", err);
  }
} else {
  // HMR or secondary import – do nothing
  console.log("[AppKit] Already initialized - skipping reinit");
}

// Export a non-null assertion for consumers that expect an adapter
export { wagmiAdapter };
