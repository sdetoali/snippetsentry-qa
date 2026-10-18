import { test, expect } from '../fixtures';
import { uniqueEmail } from '../utils/test-data';

test('TC-04 suspending a user changes their status to Suspended', async ({ usersPage }) => {
  const email = uniqueEmail('suspend');
  await usersPage.addUser({ firstName: 'Suspend', lastName: 'Tester', email });
  await usersPage.search(email);
  await expect(usersPage.statusOf(email)).toHaveText('Pending');

  await usersPage.suspendUser(email);

  await expect(usersPage.statusOf(email)).toHaveText('Suspended');
  await usersPage.captureEvidence('user listed as Suspended');
});
