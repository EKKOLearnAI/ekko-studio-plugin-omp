import { defineConfig } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default defineConfig({
  testDir: './e2e',
  outputDir: join(tmpdir(), 'ekko-studio-plugin-omp-playwright'),
  reporter: 'list',
  use: {
    ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}),
    screenshot: 'only-on-failure',
  },
})
