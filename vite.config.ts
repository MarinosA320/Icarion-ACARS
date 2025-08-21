import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Explicitly alias mapbox-gl to its ES module build
      "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js",
    },
  },
  optimizeDeps: {
    include: ['react-map-gl', 'mapbox-gl'],
  },
}));