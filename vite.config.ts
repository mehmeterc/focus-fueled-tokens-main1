import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      stream: "stream-browserify",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable node built-in modules support
      define: {
        global: "globalThis",
      },
      plugins: [
        // Add plugins to handle node built-ins if needed
      ],
    },
    include: ["buffer"],
  },
  define: {
    global: "globalThis",
    "process.env": JSON.stringify({}) // Stringify process.env for robustness
  }
}))
