import { expect, test } from '@playwright/test'

for (const width of [390, 1024, 1440]) {
  test(`French is available at a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    const header = page.getByRole('banner')
    if (width < 1001) await header.getByRole('button', { name: 'Open menu' }).click()
    const french = header.getByRole('button', { name: 'Français' })
    await expect(french).toHaveAttribute('lang', 'fr-CA')
    await french.focus()
    await page.keyboard.press('Enter')
    await expect(header.getByRole('button', { name: 'English' })).toBeFocused()
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Une touche de magie.')
    await expect(page.getByRole('heading', { name: 'Projets en vedette' })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)

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

    if (width < 1001) await header.getByRole('button', { name: 'Ouvrir le menu' }).click()
    await header.getByRole('button', { name: 'English' }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })
}
