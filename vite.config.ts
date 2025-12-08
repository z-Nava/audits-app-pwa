import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      manifest: {
        name: "Audits App",
        short_name: "Audits",
        description: "Audits Application PWA",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/assets/icon/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/icon/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
