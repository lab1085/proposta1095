import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3800 },
  plugins: [
    {
      name: "remove-ssr-external",
      configResolved(config) {
        if (config.environments.ssr) {
          config.environments.ssr.resolve.external = [];
        }
      },
    },
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsConfigPaths(),
    tanstackStart(),
    react(),
  ],
});
