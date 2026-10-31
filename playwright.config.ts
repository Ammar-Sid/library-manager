import { defineConfig, devices } from '@playwright/test';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `${npmCommand} run dev -- --port 3100`,
    url: 'http://localhost:3100',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || 'file:./e2e.db',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'playwright_local_secret_change_me',
      LIBRARY_STORAGE_DRIVER: 'local',
      NEXTAUTH_URL: 'http://localhost:3100',
    },
  },
});
