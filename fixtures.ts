import { test as base } from '@playwright/test';
import { UsersPage } from './pages/users-page';

export const test = base.extend<{ usersPage: UsersPage }>({
  usersPage: async ({ page }, use) => {
    const usersPage = new UsersPage(page);
    await usersPage.goto();
    await use(usersPage);
    for (const email of usersPage.createdEmails) await usersPage.deleteUser(email);
  },
});

export { expect } from '@playwright/test';
