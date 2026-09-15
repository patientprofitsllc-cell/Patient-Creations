import { defineConfig } from "@playwright/test";

// PORT is only for running two dev servers side by side (e.g. this sandbox
// already had something on 3000); a normal checkout just uses the default.
const port = process.env.PORT ?? "3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  webServer: {
    command: `npm run dev -- -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  use: {
    baseURL: `http://localhost:${port}`,
  },
});
