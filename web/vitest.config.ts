import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests unitaires de la logique sans interface (src/lib) ; les écrans sont couverts par Playwright (e2e/).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
