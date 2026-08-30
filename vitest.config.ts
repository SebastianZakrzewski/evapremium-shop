import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "src/widget/shop-api.test.ts",
      "src/widget/visitor.test.ts",
      "src/widget/parse-sse.test.ts",
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});






















