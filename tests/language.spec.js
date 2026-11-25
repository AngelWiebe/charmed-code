import { expect, test } from '@playwright/test'

for (const width of [390, 1024, 1101, 1440]) {
  test(`Header language links switch pages at a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    if (width === 1101) await page.route('https://fonts.googleapis.com/**', (route) => route.abort())
    await page.goto('/')

    const mobileMenu = width <= 1100
    const header = page.getByRole('banner')
    const openFrenchMenu = header.getByRole('button', { name: 'Ouvrir le menu' })
    const french = header.getByRole('link', { name: 'Français', includeHidden: true })
    if (mobileMenu) {
      await expect(french).toBeHidden()
      await header.getByRole('button', { name: 'Open menu' }).click()
    }
    await expect(french).toBeVisible()
    await expect(french).toHaveAttribute('href', '/fr/')
    await expect(french).toHaveAttribute('lang', 'fr-CA')
    await expect(french).toHaveAttribute('hreflang', 'fr-CA')
    await french.press('Enter')
    await expect(page).toHaveURL(/\/fr\/$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Une touche de magie.')
    await expect(page.getByRole('heading', { name: 'Projets en vedette' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    if (width === 1101) {
      const wrapped = await header.locator('nav a, .btn-line').evaluateAll((links) => links.filter((link) => {
        const text = document.createRange()
        text.selectNodeContents(link)
        return text.getClientRects().length > 1
      }).map((link) => link.textContent.trim()))
      expect(wrapped).toEqual([])
    }

    if (mobileMenu) await openFrenchMenu.click()
    await header.getByRole('button', { name: 'Nous joindre' }).click()
    const dialog = page.getByRole('dialog', { name: 'Parlez-nous de votre idée.' })
    await dialog.getByRole('button', { name: 'Envoyer le message' }).click()
    await expect(dialog.getByRole('alert').first()).toHaveText('Veuillez entrer votre nom.')
    await page.keyboard.press('Escape')

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA')
    await page.getByRole('button', { name: 'Politique de confidentialité' }).click()
    await expect(page.getByRole('heading', { name: '2. Renseignements recueillis' })).toBeVisible()
    await page.keyboard.press('Escape')

    if (mobileMenu) await openFrenchMenu.click()
    const english = header.getByRole('link', { name: 'English' })
    await expect(english).toHaveAttribute('href', '/')
    await expect(english).toHaveAttribute('lang', 'en')
    await english.press('Enter')
    await expect(page).toHaveURL('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A touch of magic.')

    await page.goBack()
    await expect(page).toHaveURL('/fr/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA')
  })
}

test('both languages are available to crawlers without JavaScript', async ({ browser, request, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(new URL('fr/', baseURL).href)
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA')
    await expect(page).toHaveTitle('Charmed Code | Conception et développement Web en Alberta')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Une touche de magie.')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /studio de conception/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://charmed-code.example/fr/')
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', 'https://charmed-code.example/')
    await page.getByRole('link', { name: 'English' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('link[hreflang="fr-CA"]')).toHaveAttribute('href', 'https://charmed-code.example/fr/')
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('<loc>https://charmed-code.example/fr/</loc>')
  } finally {
    await context.close()
  }
})

test('a direct French visit supports keyboard navigation from the mobile menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/fr/')

  const menu = page.getByRole('button', { name: 'Ouvrir le menu' })
  await menu.press('Enter')
  const navigation = page.getByRole('navigation', { name: 'Navigation principale' })
  await navigation.getByRole('link', { name: 'Projets' }).press('Enter')
  await expect(page.getByRole('heading', { name: 'Projets en vedette' })).toBeFocused()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(page).toHaveURL('/fr/')
})

test('the French contact form preserves a draft after a rate limit and confirms a retry', async ({ page }) => {
  let attempts = 0
  await page.route('https://formspree.io/**', (route) => {
    attempts += 1
    return route.fulfill({ status: attempts === 1 ? 429 : 200, json: { ok: attempts > 1 } })
  })
  await page.goto('/fr/')
  const contact = page.locator('#top').getByRole('button', { name: 'Nous joindre' })
  await contact.click()
  const dialog = page.getByRole('dialog', { name: 'Parlez-nous de votre idée.' })
  const description = dialog.getByRole('textbox', { name: 'Description du projet' })
  const message = 'Nous aimerions créer une boutique en ligne.'
  await dialog.getByRole('textbox', { name: 'Nom' }).fill('Élodie Martin')
  await dialog.getByRole('textbox', { name: 'Courriel' }).fill('elodie@example.com')
  await description.fill(message)

  const send = dialog.getByRole('button', { name: 'Envoyer le message' })
  await send.click()
  await expect(dialog.getByRole('alert')).toContainText('Trop de tentatives.')
  await expect(description).toHaveValue(message)
  await send.click()

  const received = page.getByRole('dialog', { name: 'Message reçu.' })
  const confirmation = received.getByRole('status')
  await expect(confirmation).toBeFocused()
  await expect(confirmation).toContainText('Merci, Élodie.')
  expect(attempts).toBe(2)
  await received.getByRole('button', { name: 'Fermer', exact: true }).click()
  await expect(contact).toBeFocused()
})

test('a French project dialog exposes the translated action and correct external link', async ({ page }) => {
  await page.goto('/fr/')
  const project = page.getByRole('article', { name: 'True Depth Capital' })
  const explore = project.getByRole('button', { name: 'Découvrir le projet' })
  await explore.click()

  const dialog = page.getByRole('dialog', { name: 'True Depth Capital' })
  await expect(dialog).toContainText('Conception Web, développement')
  await expect(dialog.getByRole('link', { name: 'Visiter le site' })).toHaveAttribute('href', 'https://truedepthcapital.ca/')
  await dialog.getByRole('button', { name: 'Fermer la boîte de dialogue' }).click()
  await expect(explore).toBeFocused()
})

test('the French testimonial carousel announces the selected quote and wraps', async ({ page }) => {
  await page.goto('/fr/')
  const testimonials = page.getByRole('region', { name: 'Témoignages' })
  const previous = testimonials.getByRole('button', { name: 'Témoignage précédent' })
  await previous.press('Enter')
  const quote = testimonials.locator('blockquote[aria-live="polite"]')
  await expect(quote).toContainText('Témoignage 3 sur 3')
  await expect(quote).toContainText('Elena V.')
  await previous.press('ArrowRight')
  await expect(quote).toContainText('Témoignage 1 sur 3')
  await expect(testimonials.getByRole('button', { name: /Afficher le témoignage de Sarah/ })).toHaveAttribute('aria-current', 'true')
})

test('the French skip link takes keyboard focus past the header to the main content', async ({ page, browserName }) => {
  await page.goto('/fr/')
  const nextLink = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' })
  const main = page.getByRole('main')

  await page.keyboard.press(nextLink)
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeInViewport()

  await page.keyboard.press('Enter')
  await expect(main.getByRole('heading', { level: 1 })).toBeFocused()

  await page.keyboard.press(nextLink)
  await expect(main.getByRole('link', { name: 'Voir les projets' })).toBeFocused()
})
