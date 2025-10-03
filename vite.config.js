// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Ensure relative asset paths so the built site works on Vercel / static hosts
  base: "./",
  build: {
    outDir: "dist",
  },
  server: {
    port: 5173,
    host: true,
  },
});
