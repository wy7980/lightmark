// Playwright E2E 测试配置
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  
  // 超时设置
  timeout: 60 * 1000,  // 每个测试 60 秒超时
  expect: {
    timeout: 10000     // 断言超时 10 秒
  },
  
  // 失败重试
  retries: process.env.CI ? 2 : 0,
  
  // 并行执行
  workers: process.env.CI ? 2 : undefined,  // CI 使用 2 个 worker 加速
  
  // 报告器
  reporter: process.env.CI ? [['list'], ['html']] : 'html',
  
  // 共享配置
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  // 项目配置 - 只保留 Chromium 以加速 CI
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // 本地测试时可以启用其他浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // Web 服务器配置（仅在本地开发时启用）
  // CI 环境中由 GitHub Actions workflow 手动启动服务器
  webServer: {
    command: 'npm run build:frontend && npx vite preview --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
