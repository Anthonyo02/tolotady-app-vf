import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./", 
  server: {
    proxy: {
      "/api": {
        target: "https://script.google.com/macros/s/AKfycbxdpPxqHw4eC_pndM5exhYIGKuSSpMJ-3CdyZYS3Agge35vBF9QvvP-DGjVs-zUf1Is/exec",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
