import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["cc24-213-230-86-70.ngrok-free.app", ".ngrok-free.app", "localhost", "127.0.0.1"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-radix";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "vendor-tanstack";
          }
          if (id.includes("node_modules/react-router") || id.includes("node_modules/react-router-dom")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/i18next") || id.includes("node_modules/react-i18next")) {
            return "vendor-i18n";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }
          if (id.includes("node_modules/zod") || id.includes("node_modules/@hookform") || id.includes("node_modules/react-hook-form")) {
            return "vendor-forms";
          }
          if (id.includes("node_modules/zustand") || id.includes("node_modules/axios")) {
            return "vendor-state";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
    globals: true,
    include: ["src/tests/**/*.test.ts", "src/tests/**/*.test.tsx", "src/tests/**/*.spec.ts", "src/tests/**/*.spec.tsx"],
    exclude: ["src/tests/e2e/**"],
  },
});
