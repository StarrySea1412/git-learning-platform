import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list']],
  use: {
    // 3000 端口常被其他项目占用，e2e 固定用 3100
    baseURL: 'http://127.0.0.1:3100',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 本地下载 chromium 超时/被墙时，可用系统浏览器：PLAYWRIGHT_CHANNEL=msedge npm run test:e2e
        ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- -p 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
