import { test, expect } from '../fixtures';
import { uniqueEmail } from '../utils/test-data';

test('TC-03 bulk invite moves a selected Pending user to Invited', async ({ usersPage }) => {
  const email = uniqueEmail('bulk');
  await usersPage.addUser({ firstName: 'Bulk', lastName: 'Invitee', email });
  await usersPage.search(email);
  await expect(usersPage.statusOf(email)).toHaveText('Pending');

  await usersPage.bulkInvite(email);

  await expect(usersPage.statusOf(email)).toHaveText('Invited');
  await usersPage.openUser(email);
  await expect(usersPage.invitationCount).toHaveText('Invitation sent: 1');
  await usersPage.captureEvidence('invited user with 1 invitation sent');
});
