import { test, expect } from '@playwright/test'

test('topbar tabs show building and review', async ({ page }) => {
  await page.goto('http://localhost:5177')
  // click Building
  await page.click('text=1. Building')
  await expect(page.locator('text=Building')).toBeVisible()
  // click Review
  await page.click('text=2. Review')
  await expect(page.locator('text=Review & BOM')).toBeVisible()
})
