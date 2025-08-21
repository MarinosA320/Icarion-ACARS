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
      // Removed: "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js",
    },
  },
  optimizeDeps: {
    // Removed: include: ['react-map-gl', 'mapbox-gl'],
  },
}));