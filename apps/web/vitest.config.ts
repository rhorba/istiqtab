import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
      exclude: [
        "src/lib/__tests__/**",
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/**/types.ts",
        // Pure data file — no executable logic to measure
        "src/lib/sector-guides.ts",
        // I/O boundary files — require real credentials/server; tested via E2E
        "src/lib/env.ts",
        "src/lib/r2.ts",
        "src/lib/auth-actions.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
