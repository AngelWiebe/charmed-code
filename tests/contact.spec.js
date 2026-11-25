import { expect, test } from '@playwright/test'

const endpoint = 'https://formspree.io/f/xppdrney'
const inquiry = {
  name: 'Jamie Example',
  email: 'jamie@example.com',
  message: 'I would like to discuss a new website.',
}

test('contact dialog validates input and restores keyboard focus when closed', async ({ page }) => {
  let requests = 0
  await page.route('https://formspree.io/**', async (route) => {
    requests++
    await route.abort()
  })
  await page.goto('/')
  const trigger = page.locator('.hero').getByRole('button', { name: 'Get in Touch' })
  await trigger.focus()
  await page.keyboard.press('Enter')

  const dialog = page.getByRole('dialog', { name: 'Tell us about your idea.' })
  const name = dialog.getByRole('textbox', { name: 'Name' })
  const email = dialog.getByRole('textbox', { name: 'Email' })
  const description = dialog.getByRole('textbox', { name: 'Project description' })
  const send = dialog.getByRole('button', { name: 'Send message' })
  for (const field of [name, email, description]) {
    await expect(field).toHaveAttribute('required', '')
  }
  await expect(name).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(dialog.getByRole('button', { name: 'Close dialog' })).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(send).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(dialog.getByText('Please enter your name.')).toBeVisible()
  await expect(name).toBeFocused()
  await name.fill(inquiry.name)
  await send.click()
  await expect(dialog.getByText('Please enter your email.')).toBeVisible()
  await expect(email).toBeFocused()
  await email.fill(inquiry.email)
  await send.click()
  await expect(dialog.getByText('Please enter a project description.')).toBeVisible()
  await expect(description).toBeFocused()
  expect(requests).toBe(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('contact submission keeps the inquiry after failure and confirms after retry succeeds', async ({ page }) => {
  const submissions = []
  await page.addInitScript(() => { AbortSignal.timeout = undefined })
  await page.route('https://formspree.io/**', async (route) => {
    const request = route.request()
    submissions.push(request)
    await route.fulfill({
      status: submissions.length === 1 ? 429 : 200,
      json: { ok: submissions.length > 1 },
    })
  })
  await page.goto('/')
  await page.locator('.hero').getByRole('button', { name: 'Get in Touch' }).click()

  const dialog = page.getByRole('dialog')
  const name = dialog.getByRole('textbox', { name: 'Name' })
  const email = dialog.getByRole('textbox', { name: 'Email' })
  const project = dialog.getByRole('textbox', { name: 'Project description' })
  const send = dialog.getByRole('button', { name: 'Send message' })
  await name.fill(inquiry.name)
  await email.fill(inquiry.email)
  await project.fill(inquiry.message)
  await send.click()

  await expect(dialog.getByRole('alert')).toContainText('Please wait a minute and try again.')
  await expect(name).toHaveValue(inquiry.name)
  await expect(email).toHaveValue(inquiry.email)
  await expect(project).toHaveValue(inquiry.message)

  await send.click()
  await expect(dialog).toHaveAccessibleName('Message received.')
  await expect(dialog.getByRole('status')).toBeFocused()
  expect(submissions).toHaveLength(2)
  for (const request of submissions) {
    expect(request.url()).toBe(endpoint)
    expect(request.method()).toBe('POST')
    expect(request.headers().accept).toBe('application/json')
    for (const [field, value] of Object.entries(inquiry)) {
      expect(request.postData()).toContain('name="' + field + '"\r\n\r\n' + value)
    }
  }
})

test('contact submission disables sending while a request is pending', async ({ page }) => {
  let release
  const pending = new Promise((resolve) => { release = resolve })
  let requests = 0
  await page.route('https://formspree.io/**', async (route) => {
    requests++
    await pending
    await route.abort('failed')
  })

  await page.goto('/')
  await page.locator('.hero').getByRole('button', { name: 'Get in Touch' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('textbox', { name: 'Name' }).fill(inquiry.name)
  await dialog.getByRole('textbox', { name: 'Email' }).fill(inquiry.email)
  await dialog.getByRole('textbox', { name: 'Project description' }).fill(inquiry.message)

  try {
    await dialog.getByRole('button', { name: 'Send message' }).click()
    await expect(dialog.getByRole('button', { name: 'Sending…' })).toBeDisabled()
    await dialog.locator('form').evaluate((form) => form.requestSubmit())
  } finally {
    release()
  }

  await expect(dialog.getByRole('alert')).toContainText('Your message could not be sent.')
  await expect(dialog.getByRole('button', { name: 'Send message' })).toBeEnabled()
  expect(requests).toBe(1)
})

test('closing contact opened from the mobile menu returns focus to the menu toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const toggle = page.getByRole('button', { name: 'Open menu' })
  await toggle.focus()
  await page.keyboard.press('Enter')

  const trigger = page.getByRole('banner').getByRole('button', { name: 'Get in Touch' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('textbox', { name: 'Name' })).toBeFocused()
  await page.keyboard.press('Escape')

  await expect(dialog).toBeHidden()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
})

test('contact submission times out and preserves the draft without AbortSignal.timeout', async ({ page }) => {
  await page.addInitScript(() => {
    AbortSignal.timeout = undefined
    const setTimeout = window.setTimeout.bind(window)
    window.setTimeout = (callback, delay, ...args) =>
      setTimeout(callback, delay === 15_000 ? 1_000 : delay, ...args)
  })
  let release
  const pending = new Promise((resolve) => { release = resolve })
  await page.route('https://formspree.io/**', async (route) => {
    await pending
    await route.abort('failed').catch(() => {})
  })

  await page.goto('/')
  await page.locator('.hero').getByRole('button', { name: 'Get in Touch' }).click()
  const dialog = page.getByRole('dialog')
  const name = dialog.getByRole('textbox', { name: 'Name' })
  const email = dialog.getByRole('textbox', { name: 'Email' })
  const project = dialog.getByRole('textbox', { name: 'Project description' })
  const send = dialog.getByRole('button', { name: 'Send message' })
  await name.fill(inquiry.name)
  await email.fill(inquiry.email)
  await project.fill(inquiry.message)

  try {
    await send.click()
    await expect(dialog.getByRole('alert')).toContainText('We couldn’t confirm delivery.')
    await expect(send).toBeEnabled()
    await expect(name).toHaveValue(inquiry.name)
    await expect(email).toHaveValue(inquiry.email)
    await expect(project).toHaveValue(inquiry.message)
  } finally {
    release()
  }
})

test('mobile contact form fits on a small screen before the keyboard opens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  await page.locator('.hero').getByRole('button', { name: 'Get in Touch' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('button', { name: 'Send message' })).toBeInViewport({ ratio: 1 })
  await expect.poll(() => dialog.evaluate((element) => element.scrollHeight - element.clientHeight))
    .toBe(0)
})
