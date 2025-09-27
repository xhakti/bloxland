import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Dev server configuration
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0) so tunnels/proxies work
    allowedHosts: true, // Allow ALL hosts (e.g. ngrok / codespaces / custom domains)
    // If you prefer to restrict later, replace `true` with an array of hostnames:
    // allowedHosts: ["despairfully-moonlit-dawna.ngrok-free.dev"]
  },
});
