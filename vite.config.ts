import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./", 
  server: {
    proxy: {
      "/api": {
        target: "https://script.google.com/macros/s/AKfycbwzATj2nIFTZb7Ptb60cXoWbjtVV0DHYQkUnnCLqhlNaps1yStrDxuk7Ql9Wx954oFY/exec",
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
