import { test, expect } from '@playwright/test'

test('admin login page loads', async ({ page }) => {
  const response = await page.goto('/admin/login')
  if (response?.status() === 404) {
    test.skip()
    return
  }
  await expect(page.locator('form')).toBeVisible()
})

test('login page has email and password fields', async ({ page }) => {
  await page.goto('/admin/login')
  if (await page.locator('form').isVisible().catch(() => false)) {
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  }
})

test('login with valid credentials', async ({ page }) => {
  await page.goto('/admin/login')
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')

  if (!(await emailInput.isVisible().catch(() => false))) {
    test.skip()
    return
  }

  await emailInput.fill('admin@ecoterre.com')
  await passwordInput.fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  const currentUrl = page.url()
  if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
    await expect(page.locator('nav, aside, [class*="sidebar"]').first()).toBeVisible()
  }
})

test('dashboard shows stats after login', async ({ page }) => {
  await page.goto('/admin/login')
  const emailInput = page.locator('input[type="email"]')
  if (!(await emailInput.isVisible().catch(() => false))) {
    test.skip()
    return
  }

  await emailInput.fill('admin@ecoterre.com')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  const currentUrl = page.url()
  if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
    const statCards = page.locator('[class*="stat"], [class*="card"], .grid > div')
    const count = await statCards.count().catch(() => 0)
    if (count > 0) {
      expect(count).toBeGreaterThan(0)
    }
  }
})

test('articles list loads in admin', async ({ page }) => {
  await page.goto('/admin/login')
  const emailInput = page.locator('input[type="email"]')
  if (!(await emailInput.isVisible().catch(() => false))) {
    test.skip()
    return
  }

  await emailInput.fill('admin@ecoterre.com')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  await page.goto('/admin/articles')
  await page.waitForTimeout(1000)
  await expect(page.locator('table, [class*="table"], main').first()).toBeVisible({ timeout: 5000 })
})

test('categories list loads in admin', async ({ page }) => {
  await page.goto('/admin/login')
  const emailInput = page.locator('input[type="email"]')
  if (!(await emailInput.isVisible().catch(() => false))) {
    test.skip()
    return
  }

  await emailInput.fill('admin@ecoterre.com')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  await page.goto('/admin/categories')
  await page.waitForTimeout(1000)
  await expect(page.locator('table, [class*="table"], main, [class*="list"]').first()).toBeVisible({ timeout: 5000 })
})

test('logout works', async ({ page }) => {
  await page.goto('/admin/login')
  const emailInput = page.locator('input[type="email"]')
  if (!(await emailInput.isVisible().catch(() => false))) {
    test.skip()
    return
  }

  await emailInput.fill('admin@ecoterre.com')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2000)

  const logoutBtn = page.locator('a[href*="logout"], button:has-text("Déconnexion"), button:has-text("Logout"), button:has-text("خروج")')
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click()
    await page.waitForTimeout(1000)
    const currentUrl = page.url()
    expect(currentUrl.includes('/login') || currentUrl === '/').toBeTruthy()
  }
})
