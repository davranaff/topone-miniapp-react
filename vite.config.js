import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
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
