import { expect, test } from '@playwright/test'

const siteOrigin = 'https://charmed-code.example'

test('production HTML contains homepage content and public search metadata', async ({ request }) => {
  const response = await request.get('/')
  await expect(response).toBeOK()
  const html = await response.text()

  expect(html).toMatch(/<h1[^>]*>\s*Thoughtfully crafted software\./)
  expect(html).toContain('Our Services')
  expect(html).toContain('href="' + siteOrigin + '/"')
  expect(html).toContain('property="og:image" content="' + siteOrigin + '/og.jpg"')

  const sitemap = await request.get('/sitemap.xml')
  await expect(sitemap).toBeOK()
  expect(await sitemap.text()).toContain('<loc>' + siteOrigin + '/</loc>')

  const robots = await request.get('/robots.txt')
  await expect(robots).toBeOK()
  expect(await robots.text()).toContain('Sitemap: ' + siteOrigin + '/sitemap.xml')
})

test('mobile viewport is established before the responsive image preload', async ({ request }) => {
  const response = await request.get('/')
  await expect(response).toBeOK()
  const html = await response.text()

  expect(html).toMatch(/<meta name="viewport"[^>]*>[\s\S]*<link rel="preload"[^>]*hero-background-mobile/)
})

test('mobile menu returns focus on Escape and moves focus to the chosen section', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: /Thoughtfully crafted software/ })).toBeFocused()

  const toggle = page.getByRole('button', { name: 'Open menu' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Home', exact: true })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(toggle).toBeFocused()

  await page.keyboard.press('Enter')
  const services = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services', exact: true })
  await page.keyboard.press('Tab')
  await expect(services).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  const heading = page.getByRole('heading', { name: 'Our Services' })
  await expect(heading).toBeFocused()
  await expect(heading).toHaveCSS('outline-style', 'none')
  await expect(heading).toHaveCSS('box-shadow', 'none')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Learn More About Us' })).toBeFocused()
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

test('footer artwork loads when the footer approaches the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const isFooterImage = (url) => /\/footer-background-[^/]+\.webp$/.test(url)
  const footerRequests = []
  page.on('request', (request) => {
    if (isFooterImage(request.url())) footerRequests.push(request.url())
  })

  await page.goto('/')
  const artwork = page.locator('.cta-background')
  await expect(artwork).toHaveAttribute('loading', 'lazy')
  expect(footerRequests).toHaveLength(0)

  const loaded = page.waitForResponse((response) => isFooterImage(response.url()) && response.ok())
  await artwork.scrollIntoViewIfNeeded()
  await loaded
  await expect(artwork).toHaveJSProperty('complete', true)
  expect(footerRequests).toHaveLength(1)
})

test('desktop header logo keeps its dimensions when the header becomes solid', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  const header = page.getByRole('banner')
  const logo = header.locator('.logo-btn img')
  await expect(logo).toHaveCSS('height', '74px')
  await expect(logo).toHaveCSS('width', '148px')

  await page.evaluate(() => window.scrollTo(0, 100))
  await expect(header).toHaveClass(/is-solid/)
  await expect(logo).toHaveCSS('height', '74px')
  await expect(logo).toHaveCSS('width', '148px')
})

test('the header fades to solid without moving its contents', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const header = page.getByRole('banner')
  const height = await header.evaluate((element) => element.getBoundingClientRect().height)
  const gradient = await header.evaluate((element) => getComputedStyle(element).backgroundImage)

  await header.evaluate((element) => {
    element.addEventListener('transitionrun', (event) => {
      if (event.propertyName === 'opacity' && event.pseudoElement === '::before') {
        element.dataset.fading = 'true'
      }
    })
    window.scrollTo(0, 100)
  })

  await expect(header).toHaveClass(/is-solid/)
  await expect(header).toHaveAttribute('data-fading', 'true')
  await expect(header).toHaveCSS('background-image', gradient)
  await expect(header).toHaveCSS('height', `${height}px`)
  await expect.poll(() => header.evaluate((element) => getComputedStyle(element, '::before').opacity)).toBe('1')
})

test('Projects traces the crescent after smooth scrolling reaches the section', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const ornament = page.locator('.work-ornament')
  await expect(ornament.locator('.work-crescent-spark')).toHaveCount(0)
  await ornament.evaluate((element) => {
    element.addEventListener('animationstart', () => {
      const kicker = document.querySelector('#work-title')
      element.dataset.traceStartTop = kicker.getBoundingClientRect().top
    }, { once: true })
  })
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(ornament.locator('.work-crescent-spark')).toHaveCSS('animation-name', 'work-crescent-travel')
  await expect(ornament).toHaveAttribute('data-trace-start-top', /.+/)
  const startTop = Number(await ornament.getAttribute('data-trace-start-top'))
  const navOffset = await page.evaluate(() => parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-scroll-offset'),
  ))
  expect(Math.abs(startTop - navOffset)).toBeLessThan(2)
})

test('Projects keeps the crescent still with reduced motion', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Projects', exact: true }).click()
  const ornament = page.locator('.work-ornament')
  await expect(ornament).toBeInViewport()
  await expect(ornament.locator('.work-crescent')).toHaveCSS('animation-name', 'none')
  await expect(ornament.locator('.work-crescent-spark')).toHaveCount(0)
})

test('the Featured Work crescent stays compact on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('.work-ornament svg')).toHaveCSS('width', '28px')
})

test('clicking the page outside the mobile menu closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const navigation = page.getByRole('navigation', { name: 'Primary' })
  await expect(navigation).toBeVisible()

  await page.mouse.click(10, 800)

  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  await expect(navigation).toBeHidden()
})


test('the castle journey presents services, experience, and featured work in order', async ({ page }) => {
  await page.goto('/')
  const headings = page.locator('main section').getByRole('heading', { level: 2 })
  await expect(headings).toHaveText([
    'Our Services',
    'About Charmed Code',
    'Notable Experience',
    'Featured Projects',
    'Kind words',
  ])
  const services = page.getByRole('list', { name: 'Development and consulting services' })
  await expect(services.getByRole('heading', { level: 3 })).toHaveText([
    'Custom Development',
    'Websites & Web Apps',
    'Mobile App Development',
    'Shopify & E-commerce Integrations',
    'Consulting & Support',
  ])
  const about = page.getByRole('region', { name: 'About Charmed Code' })
  await expect(about).toContainText('11+ years')
  await expect(about).toContainText('5 years')
  const experience = page.getByRole('region', { name: 'Notable Experience' })
  await expect(experience.getByRole('heading', { level: 3 })).toHaveCount(4)
  for (const name of ['Staples', 'Intuit Mailchimp', 'Topstep', 'Shopify']) {
    await expect(experience.getByRole('heading', { name, exact: true })).toBeVisible()
  }
})

test('castle motion tracks scroll and clears when reduced motion is enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const scene = page.locator('.castle-valley')
  await expect(scene.locator('#services')).toHaveCount(1)
  await expect(scene.locator('#about')).toHaveCount(1)
  await expect(scene.locator('#work')).toHaveCount(1)
  await expect(scene.getByRole('heading', { name: 'Kind words' })).toHaveCount(1)
  const landscape = scene.locator('.castle-landscape')
  await expect(landscape).toHaveCount(1)
  await expect(landscape).not.toHaveCSS('transform', 'none')
  const scale = () => landscape.evaluate((image) => new DOMMatrixReadOnly(getComputedStyle(image).transform).a)
  const initialScale = await scale()
  await page.locator('#about-title').scrollIntoViewIfNeeded()
  await expect.poll(() => landscape.evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)
  await expect.poll(scale).toBeGreaterThan(initialScale)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(landscape).toHaveCSS('transform', 'none')
})
