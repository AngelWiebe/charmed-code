import { expect, test } from '@playwright/test'

test('testimonial controls wrap around and expose the selected quote', async ({ page }) => {
  await page.goto('/')
  const previous = page.getByRole('button', { name: 'Previous testimonial' })
  const quote = page.locator('blockquote')
  const first = page.getByRole('button', { name: /Show testimonial from Sarah/ })
  const second = page.getByRole('button', { name: /Show testimonial from Jordan/ })
  const last = page.getByRole('button', { name: /Show testimonial from Elena/ })

  await expect(first).toHaveAttribute('aria-current', 'true')
  await previous.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(quote).toContainText('Elena V.')
  await expect(last).toHaveAttribute('aria-current', 'true')
  await page.keyboard.press('ArrowRight')
  await expect(quote).toContainText('Sarah M.')
  await second.click()
  await expect(quote).toContainText('Jordan A.')
  await expect(second).toHaveAttribute('aria-current', 'true')
})

for (const { trigger, article, title } of [
  { trigger: 'Learn More About Us', title: 'A studio for imaginative work.' },
  { trigger: 'Explore the project', article: 'DLR Consulting Ltd.', title: 'DLR Consulting Ltd.' },
  { trigger: 'Privacy Policy', title: 'Privacy Policy' },
]) {
  test(title + ' dialog keeps the page inert and restores focus', async ({ page }) => {
    await page.goto('/')
    const scope = article ? page.getByRole('article', { name: article }) : page
    const button = scope.getByRole('button', { name: trigger })
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await button.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeFocused()
    await expect(page.locator('main')).toHaveAttribute('inert', '')
    await expect(page.locator('footer.cta')).toHaveAttribute('inert', '')
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(dialog).toBeHidden()
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    await expect(button).toBeFocused()
  })
}

test('True Depth Capital opens its project details and provides a link to the site', async ({ page }) => {
  await page.goto('/')
  const feature = page.getByRole('article', { name: 'True Depth Capital' })
  await expect(feature.locator('img')).toBeVisible()
  await feature.getByRole('button', { name: 'Explore the project' }).click()

  const dialog = page.getByRole('dialog', { name: 'True Depth Capital' })
  await expect(dialog).toContainText('vehicle sourcing')
  await expect(dialog.getByRole('link', { name: 'Visit the site' }))
    .toHaveAttribute('href', 'https://truedepthcapital.ca/')
  await expect.poll(() => dialog.locator('img').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0)
})

test('the footer provides section navigation and opens contact with focus restoration', async ({ page }) => {
  await page.goto('/')
  const footer = page.getByRole('contentinfo', { name: 'Charmed Code footer' })
  const nav = footer.getByRole('navigation', { name: 'Footer' })
  await nav.getByRole('link', { name: 'Projects' }).click()
  await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeFocused()
  await nav.getByRole('link', { name: 'Kind Words' }).click()
  await expect(page.getByRole('heading', { name: 'Kind words' })).toBeFocused()

  const contact = nav.getByRole('button', { name: 'Contact' })
  await contact.click()
  await expect(page.getByRole('dialog', { name: 'Tell us about your idea.' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(contact).toBeFocused()
})
