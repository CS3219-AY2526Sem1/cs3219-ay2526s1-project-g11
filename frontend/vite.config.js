import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/questions": {
        target:
          "https://question-service-1015946686380.asia-southeast1.run.app",
        changeOrigin: true,
      },
    },
  },
});
