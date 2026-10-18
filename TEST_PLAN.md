# Test Plan: SnippetSentry "Manage Users"

## Scope

Everything that comes from the **Users List** component at `/app/client/users`: Search, Add User, Bulk Upload, Bulk Invite, Export, the status filter, Clear Filters, row selection, and the Modify User panel (edit, Send email invite, Suspend, Delete).

Out of scope, as the brief says: the left menu (Settings, Channel Dashboard) and the top-right icons.

**Environment:** `https://dev.snippetsentry.com`, logged in as a customer admin, in Chrome. New users get Gmail plus-addressed emails (`me+tag@gmail.com`), so every invite reaches an inbox I can read.

## How the feature works (from exploration)

Users belong to a customer account (the read-only "Customer Name" field). An admin creates users, invites them by email, and can suspend or delete them.

| Status | How a user gets there | Observed? |
|---|---|---|
| **Pending** | Added without "Send email invite" | Yes |
| **Invited** | An invite is sent: from Add User, from the Modify User panel, or from Bulk Invite | Yes |
| **Active** | Presumably the user accepts the invite and sets a password | Inferred; see TC-05 |
| **Suspended** | An admin clicks Suspend and confirms | Yes |

Other observations:
- Email and Customer Name are read-only after creation. First Name, Last Name, Admin and Notes can be edited.
- The Modify User panel shows an invitation counter ("Invitation sent: N").
- Bulk Invite works only on the selected rows. Its dialog states the count and says Active users won't get an email.
- Search matches on email. The status filter options are All, Active, Suspended, Invited and Pending.

## Test cases

Priority: **P1** = core flow or data/security risk, **P2** = important, **P3** = nice to have.
**Auto** = automated in this repo.

| ID | Title | Pri | Auto |
|---|---|---|---|
| TC-01 | Add user without invite is listed as Pending | P1 | ✅ |
| TC-02 | Add admin user with invite is listed as Invited | P1 | ✅ |
| TC-03 | Bulk Invite moves selected users to Invited | P1 | ✅ |
| TC-04 | Suspend user changes status to Suspended | P1 | ✅ |
| TC-05 | Invited user accepts invite and becomes Active | P1 | |
| TC-06 | Delete user removes them from the list | P1 | |
| TC-07 | Add User validation and duplicate emails | P1 | |
| TC-08 | Edit user persists changes; locked fields stay locked | P2 | |
| TC-09 | Suspended user loses access and can be recovered | P1 | |
| TC-10 | Logged-in user and last-admin protection | P1 | |
| TC-11 | Bulk Upload: valid, invalid and mixed files | P2 | |
| TC-12 | Search, status filter, record count and Export agree | P2 | |
| TC-13 | Non-admin users cannot manage users | P1 | |

### TC-01: Add user without invite is listed as Pending
1. Click Add User. Enter a first name, last name and unique email, and leave both checkboxes unticked. Click Save.
2. Search for the email.

**Expected:** a "User added successfully" toast appears, the row shows the full name, and the status is **Pending**.

### TC-02: Add admin user with invite is listed as Invited
1. Click Add User, tick **Admin** and **Send email invite**, fill in the fields, and click Save.
2. Search for the email, then open the user.

**Expected:** status **Invited**, Admin is ticked in the panel, the panel shows "Invitation sent: 1", and the invite email arrives.
**Note:** in automated runs the list still showed Pending immediately after saving. When I checked by hand it showed Invited, with or without a reload (see BUG-01). The automated test reloads before asserting so it checks the saved state.

### TC-03: Bulk Invite moves selected users to Invited
1. Create a Pending user, select its row, and click Bulk Invite.
2. Check the dialog text, then click Confirm.

**Expected:** the dialog says "send an invite to 1 user(s)", the toast says "All invitations were sent successfully", the status becomes **Invited**, and the counter shows 1.
**Variant (manual):** select a mix of Pending, Invited and Active users. Only Pending and Invited users should receive an email, and the count in the dialog should match the selection.

### TC-04: Suspend user changes status to Suspended
1. Open a user, click Suspend, and click Confirm.

**Expected:** the toast says "User status updated successfully" and the status is **Suspended** right away.

### TC-05: Invited user accepts invite and becomes Active
1. Invite a user, open the email, follow the link, and set a password.
2. Log in as that user, and check the status from the admin account.

**Expected:** the status becomes **Active**, and the user can log in. The invite link is single-use, and an older link stops working after a re-invite.
**Why manual:** it needs inbox access. It could be automated later with a test mailbox API.

### TC-06: Delete user removes them from the list
1. Open a user, click Delete, and click Confirm.

**Expected:** the row disappears and the record count drops by 1. Check whether the same email can be added again afterward, and whether a deleted user can still log in.
**Note:** the confirmation text doesn't mention deleting (see BUG-02).

### TC-07: Add User validation and duplicate emails
- Leave each required field empty in turn. Save should be blocked, with a message on that field.
- Try invalid email formats: `a@`, `@b.com`, `a b@c.com`.
- Add an email that already exists, then the same email in different case (`ME+x@gmail.com` vs `me+x@gmail.com`).
- Add an email that already belongs to another customer account.

**Expected:** clear errors, and no duplicate users, including case-only duplicates.

### TC-08: Edit user persists changes; locked fields stay locked
1. Change the first name, last name, Admin and Notes, then click Save.
2. Reload the page and reopen the user.

**Expected:** the changes persist. Email and Customer Name can't be edited. Cancel discards unsaved changes.

### TC-09: Suspended user loses access and can be recovered
1. Suspend an Active user, then try to log in as them.
2. Look for a way to reactivate them.

**Expected:** login is refused with a clear message, and an admin has a way to restore the user.
**Observed (manual):** a suspended user's panel still shows **Suspend**. There is no Reactivate, Unsuspend or Activate option in the panel, the row or the filter, and Send email invite is still clickable (see BUG-03 and Q-01).

### TC-10: Logged-in user and last-admin protection
- Try to suspend, delete, or remove Admin from your own account.
- Try to remove Admin from, or suspend, the last remaining admin.

**Expected:** the app blocks actions that would lock the account out, or at least warns clearly before allowing them.

### TC-11: Bulk Upload: valid, invalid and mixed files
- Check whether a template is provided.
- Upload a valid file, an empty file, a file in the wrong format, a file with bad rows, and a file with duplicates (within the file, and against existing users).

**Expected:** valid rows are created with the correct status, invalid rows are reported per row, and nothing is half-created without a report.

### TC-12: Search, status filter, record count and Export agree
- Search by full and partial name and by email, in different letter case.
- Combine search with each status filter, then use Clear Filters to reset both.
- Export, and compare the file with the grid.

**Expected:** results, the "Showing N records" / "Filtering to N results" label, and the exported rows all match.

### TC-13: Non-admin users cannot manage users
1. Log in as a non-admin user (created via TC-05).
2. Open `/app/client/users` directly, and also try the actions through the API.

**Expected:** access is denied in both the UI and the API, and nothing is visible from other customer accounts.

## Beyond functional testing

- **Security:** authorization in TC-13. Input like `<script>alert(1)</script>` in the name and notes fields should be shown as plain text and never run, both in the grid and in Export. Check that users from other customer accounts can't be read.
- **Usability:** confirmation text should name the action (BUG-02). A suspended user should have a visible way back (BUG-03).
- **Performance:** the list with hundreds of users (the table is virtualized), and Bulk Invite or Upload with large selections or files.
- **Email:** content, links and sender of the invite emails, and whether re-invites are rate-limited.

## Bugs and open questions

| ID | Summary | Severity | Verified manually |
|---|---|---|---|
| BUG-01 | After Add User with "Send email invite", the list showed **Pending** instead of Invited, but only in automated runs immediately after saving. | Low (intermittent) | **Not reproduced.** By hand it showed Invited, with or without a reload
| BUG-02 | Delete and Suspend share the confirmation "Are you sure you want to update status of this user?". It doesn't say the user will be deleted. | Medium | **Reproduced** |
| BUG-03 | A suspended user's panel still shows **Suspend**, with no Reactivate, Unsuspend or Activate option anywhere. | Medium (or missing feature) | **Reproduced** |
| Q-01 | "Send email invite" is still clickable for suspended users. Is that intended? | Question | **Confirmed** clickable |

## Automation summary

TC-01 to TC-04 are automated with Playwright and TypeScript (`tests/`). I chose them because they cover the main create and invite flow plus three of the four statuses, and they need no inbox access. TC-05 (Active) is the next candidate once a test mailbox is available.
