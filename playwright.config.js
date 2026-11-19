import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    env: { SITE_ORIGIN: 'https://charmed-code.example' },
    url: 'http://127.0.0.1:4173',
    timeout: 60_000,
  },
})
