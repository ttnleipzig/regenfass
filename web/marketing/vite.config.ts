import path from "node:path";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@regenfass/brand/styles.css": path.resolve(
        __dirname,
        "../brand/src/styles.css",
      ),
      "@regenfass/brand/tailwind.preset.cjs": path.resolve(
        __dirname,
        "../brand/tailwind.preset.cjs",
      ),
    },
    dedupe: ["solid-js", "@solidjs/router", "@kobalte/core"],
  },
  server: {
    port: 5175,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
});
