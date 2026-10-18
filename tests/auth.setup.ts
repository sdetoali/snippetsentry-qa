import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/app/client/users');
  await page.getByLabel(/email/i).fill(process.env.SS_EMAIL!);
  await page.getByLabel(/^password\*?$/i).fill(process.env.SS_PASSWORD!);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Users List')).toBeVisible();
  await page.context().storageState({ path: '.auth/user.json' });
});