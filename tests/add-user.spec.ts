import { test, expect } from '../fixtures';
import { uniqueEmail } from '../utils/test-data';

test.describe('Add User', () => {
  test('TC-01 user added without an invite is listed as Pending', async ({ usersPage }) => {
    const email = uniqueEmail('pending');
    await usersPage.addUser({ firstName: 'Auto', lastName: 'Tester', email });

    await usersPage.search(email);
    await expect(usersPage.row(email)).toContainText('Auto Tester');
    await expect(usersPage.statusOf(email)).toHaveText('Pending');
    await usersPage.captureEvidence('user listed as Pending');
  });

  test('TC-02 admin user added with an invite is listed as Invited', async ({ usersPage }) => {
    const email = uniqueEmail('admin');
    await usersPage.addUser({ firstName: 'Admin', lastName: 'Tester', email, admin: true, sendInvite: true });

    await usersPage.goto();
    await usersPage.search(email);
    await expect(usersPage.statusOf(email)).toHaveText('Invited');

    await usersPage.openUser(email);
    await expect(usersPage.adminCheckbox).toBeChecked();
    await expect(usersPage.invitationCount).toHaveText('Invitation sent: 1');
    await usersPage.captureEvidence('admin user with 1 invitation sent');
  });
});
