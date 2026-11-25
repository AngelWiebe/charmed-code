import { defineConfig } from '@playwright/test'

const port = process.env.PLAYWRIGHT_PORT || '4173'
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    browserName: process.env.PLAYWRIGHT_BROWSER || 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --strictPort`,
    env: { SITE_ORIGIN: 'https://charmed-code.example' },
    url: baseURL,
    timeout: 60_000,
  },
})
