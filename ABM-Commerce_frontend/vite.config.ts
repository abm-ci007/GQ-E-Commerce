import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackStart({ server: { entry: "server" } }),
    react(),
    tailwindcss(),
    nitro({ preset: "node-server" }),
  ],
  resolve: { tsconfigPaths: true },
  // Bind to loopback so a stale LAN/wildcard listener on port 5173 cannot
  // prevent the local storefront from starting. Vite can choose the next port.
  server: { host: "127.0.0.1", port: 5173, strictPort: false },
});
