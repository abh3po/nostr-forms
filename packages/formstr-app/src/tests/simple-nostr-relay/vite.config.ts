import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@/validators": "/src/generated/typia",
      "@": "/src",
    },
  },
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
