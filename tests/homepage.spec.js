import { expect, test } from '@playwright/test'

const siteOrigin = 'https://charmed-code.example'

test('production HTML contains homepage content and public search metadata', async ({ request }) => {
  const response = await request.get('/')
  await expect(response).toBeOK()
  const html = await response.text()

  expect(html).toMatch(/<h1[^>]*>Charmed Code<\/h1>/)
  expect(html).toContain('Websites with a little more wonder.')
  expect(html).toContain('href="' + siteOrigin + '/"')
  expect(html).toContain('property="og:image" content="' + siteOrigin + '/og.jpg"')

  const sitemap = await request.get('/sitemap.xml')
  await expect(sitemap).toBeOK()
  expect(await sitemap.text()).toContain('<loc>' + siteOrigin + '/</loc>')

  const robots = await request.get('/robots.txt')
  await expect(robots).toBeOK()
  expect(await robots.text()).toContain('Sitemap: ' + siteOrigin + '/sitemap.xml')
})

test('mobile menu returns focus on Escape and moves focus to the chosen section', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Charmed Code', exact: true })).toBeFocused()

  const toggle = page.getByRole('button', { name: 'Open menu' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('link', { name: 'Home', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()

  await page.keyboard.press('Enter')
  const services = page.getByRole('link', { name: 'Services', exact: true })
  await page.keyboard.press('Tab')
  await expect(services).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('heading', { name: 'Websites with a little more wonder.' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Our Story' })).toBeFocused()
})

for (const { name, viewport, asset } of [
  { name: 'portrait mobile', viewport: { width: 390, height: 844 }, asset: 'hero-background-mobile' },
  { name: 'desktop', viewport: { width: 1440, height: 900 }, asset: 'hero-background' },
]) {
  test(name + ' fetches only the matching hero image', async ({ page }) => {
    await page.setViewportSize(viewport)
    const heroRequests = []
    page.on('request', (request) => {
      const filename = new URL(request.url()).pathname.split('/').pop()
      if (filename.startsWith('hero-background-')) heroRequests.push(filename)
    })
    const heroResponse = page.waitForResponse((response) => {
      const filename = new URL(response.url()).pathname.split('/').pop()
      return filename.startsWith('hero-background-') && response.ok()
    })
    await page.goto('/')
    await heroResponse
    await expect(page.locator('.hero')).toHaveCSS('background-image', new RegExp('/assets/' + asset + '-'))
    expect(heroRequests).toHaveLength(1)
    expect(heroRequests[0].startsWith('hero-background-mobile-')).toBe(name === 'portrait mobile')
  })
}
