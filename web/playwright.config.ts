import { defineConfig, devices } from "@playwright/test";

// Parcours de démonstration (cahier des charges, section 7), joué sur les mocks [FICTIF].
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [
    { name: "telephone", use: { ...devices["Pixel 7"] } },
    { name: "ordinateur", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npx next start --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_USE_MOCKS: "true" },
  },
});
