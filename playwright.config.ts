import { defineConfig, devices } from '@playwright/test';

try { process.loadEnvFile(); } catch { /* no .env file; rely on real env vars (e.g. CI) */ }

export default defineConfig({
  testDir: './tests',
  workers: 1, // shared dev environment: tests mutate the same user list
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://dev.snippetsentry.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});