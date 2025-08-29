import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.picreel.com/blog/popup-overlay-examples/');
  await page.getByText('A pop up like this one could').click();
  await page.locator('#content_7814').click();
});