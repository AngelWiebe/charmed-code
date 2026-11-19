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

for (const { trigger, title } of [
  { trigger: 'Our Story', title: 'A studio for imaginative work.' },
  { trigger: /^DLR Consulting Ltd\./, title: 'DLR Consulting Ltd.' },
  { trigger: 'Privacy Policy', title: 'Privacy Policy' },
]) {
  test(title + ' dialog keeps the page inert and restores focus', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: trigger })
    await button.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: title })
    await expect(dialog).toBeFocused()
    await expect(page.locator('main')).toHaveAttribute('inert', '')
    await page.keyboard.press('Tab')
    await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(dialog).toBeHidden()
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    await expect(button).toBeFocused()
  })
}
