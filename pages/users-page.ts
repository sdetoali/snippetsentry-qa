import { expect, test, type Locator, type Page } from '@playwright/test';

export type NewUser = {
  firstName: string;
  lastName: string;
  email: string;
  admin?: boolean;
  sendInvite?: boolean;
};

export class UsersPage {
  readonly createdEmails: string[] = [];
  readonly searchBox: Locator;
  readonly invitationCount: Locator;
  readonly adminCheckbox: Locator;

  constructor(readonly page: Page) {
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.invitationCount = page.getByTestId('sent-email-count-text');
    this.adminCheckbox = page.getByRole('checkbox', { name: 'Admin', exact: true });
  }

  async goto() {
    await this.page.goto('/app/client/users');
    await expect(this.page.getByText('Users List')).toBeVisible();
  }

  async search(text: string) {
    await this.searchBox.fill(text);
  }

  row(email: string): Locator {
    return this.page.getByRole('row').filter({ hasText: email });
  }

  // Columns: checkbox, name, status, email
  statusOf(email: string): Locator {
    return this.row(email).getByRole('cell').nth(2);
  }

  async addUser(user: NewUser) {
    await this.page.getByRole('button', { name: /add user/i }).click();
    if (user.admin) await this.adminCheckbox.check();
    if (user.sendInvite) await this.page.getByRole('checkbox', { name: 'Send email invite' }).check();
    await this.page.getByLabel(/^first name/i).fill(user.firstName);
    await this.page.getByLabel(/^last name/i).fill(user.lastName);
    await this.page.getByLabel(/^email/i).fill(user.email);
    await this.page.getByRole('button', { name: /^save$/i }).click();
    await expect(this.page.getByText('User added successfully')).toBeVisible();
    this.createdEmails.push(user.email);
  }

  async bulkInvite(email: string) {
    await this.row(email).getByRole('checkbox').check();
    await this.page.getByRole('button', { name: /bulk invite/i }).click();
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toContainText('send an invite to 1 user(s)');
    await dialog.getByRole('button', { name: /confirm/i }).click();
    await expect(this.page.getByText('All invitations were sent successfully')).toBeVisible();
  }

  async openUser(email: string) {
    await this.row(email).getByTestId('user-name-in-list').click();
  }

  async suspendUser(email: string) {
    await this.openUser(email);
    await this.page.getByTestId('archive-button').click();
    await this.confirm();
    await expect(this.page.getByText('User status updated successfully')).toBeVisible();
  }

  async deleteUser(email: string) {
    await this.goto();
    await this.search(email);
    await this.openUser(email);
    await this.page.getByTestId('delete-user-button').click();
    await this.confirm();
    await expect(this.row(email)).toHaveCount(0);
  }

  async captureEvidence(name: string) {
    await test.info().attach(name, { body: await this.page.screenshot(), contentType: 'image/png' });
  }

  private async confirm() {
    await this.page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();
  }
}
