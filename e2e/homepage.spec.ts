import { test, expect } from '@playwright/test'

test('homepage loads successfully (FR)', async ({ page }) => {
  const response = await page.goto('/fr')
  expect(response?.status()).toBeLessThan(400)
  await expect(page.locator('body')).toBeVisible()
  await expect(page).toHaveTitle(/Ecoterre/)
})

test('homepage loads successfully (AR) with RTL', async ({ page }) => {
  const response = await page.goto('/ar')
  expect(response?.status()).toBeLessThan(400)
  const html = page.locator('html')
  await expect(html).toHaveAttribute('dir', 'rtl')
})

test('language switcher works (FR to AR)', async ({ page }) => {
  await page.goto('/fr')
  const switcher = page.locator('[data-testid="lang-switcher"], a[href*="/ar"]').first()
  if (await switcher.isVisible()) {
    await switcher.click()
    await page.waitForURL(/\/ar/)
    expect(page.url()).toContain('/ar')
  }
})

test('language switcher works (AR to FR)', async ({ page }) => {
  await page.goto('/ar')
  const switcher = page.locator('[data-testid="lang-switcher"], a[href*="/fr"]').first()
  if (await switcher.isVisible()) {
    await switcher.click()
    await page.waitForURL(/\/fr/)
    expect(page.url()).toContain('/fr')
  }
})

test('navigation links are present', async ({ page }) => {
  await page.goto('/fr')
  const nav = page.locator('nav').first()
  await expect(nav).toBeVisible()
  const links = nav.locator('a')
  const count = await links.count()
  expect(count).toBeGreaterThan(0)
})

test('search bar is visible and accepts input', async ({ page }) => {
  await page.goto('/fr')
  const searchInput = page.locator('input[type="search"]')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('écologie')
  expect(await searchInput.inputValue()).toBe('écologie')
})

test('search bar submits', async ({ page }) => {
  await page.goto('/fr')
  const searchInput = page.locator('input[type="search"]')
  await searchInput.fill('environnement')
  await searchInput.press('Enter')
  await page.waitForURL(/\/search\?q=/)
  expect(page.url()).toContain('q=environnement')
})

test('hero section displays', async ({ page }) => {
  await page.goto('/fr')
  const hero = page.locator('section').first()
  await expect(hero).toBeVisible()
})

test('footer is visible', async ({ page }) => {
  await page.goto('/fr')
  const footer = page.locator('footer')
  await expect(footer).toBeVisible()
})

test('page has correct lang attribute in FR', async ({ page }) => {
  await page.goto('/fr')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('lang', 'fr')
})

test('page has correct lang attribute in AR', async ({ page }) => {
  await page.goto('/ar')
  const html = page.locator('html')
  await expect(html).toHaveAttribute('lang', 'ar')
})
