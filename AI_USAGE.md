# AI Usage

I used **Claude (Anthropic)** as an AI assistant throughout this assessment, in a single conversation in the Claude app. With my permission, Claude could do three things: drive a Chrome tab where I was already logged in to SnippetSentry, read and write files in this project folder, and read the assessment PDF. It could not run commands on my machine. I ran every install, test run and git command myself.

No separate skill, prompt or instruction files were used. All direction happened in the conversation, and the main prompts are summarized below.

## What Claude did

| Area | What Claude did |
|---|---|
| **Reading the brief** | Summarized the assessment and proposed a plan and time budget: explore, write the test plan, automate, then package. |
| **Project setup** | Gave the scaffolding commands and wrote `playwright.config.ts` and `setup/auth.setup.ts` (login once, saved session reused by every test). |
| **Exploration** | Drove Chrome to inspect the Users page: Add User form, status filter, Modify User panel, Bulk Invite dialog, Suspend and Delete confirmations. It created throwaway users with my `+tag` emails, invited, suspended and deleted them, and read `data-testid` attributes from the page. It did this under my direction, using only throwaway users it created. |
| **Automation code** | Wrote `pages/users-page.ts` (page object), `fixtures.ts` (custom fixture with automatic cleanup), `utils/test-data.ts`, and the four spec files, writing them directly into this folder. |
| **Debugging** | Read the failure screenshots and `error-context.md` files from my runs and proposed fixes (details below). |
| **Test plan** | Drafted `TEST_PLAN.md` from what we observed while exploring. |
| **Docs** | Drafted this file and `README.md`. |

## What I did

- Set up my account, Node, Git and the Playwright project, and kept credentials in a git-ignored `.env`.
- Chose Playwright with TypeScript, and set the scope: UI-only assertions, no inbox checks, 4 tests within the required 3–5.
- Ran every test locally and fed the real output back to Claude.
- Directed what Claude explored and changed in the app, and kept it to throwaway users with my own `+tag` emails.
- Verified that the tests can actually fail: I changed the Suspend assertion to expect `Active`, confirmed it failed with `Expected "Active" / Received "Suspended"`, then restored it.
- Reviewed and edited the test plan (see "My changes" below).

## Debugging history

Each of these came from a real failed run. They're why I'm confident the tests check what they claim to.

1. **Strict-mode violation on login.** `getByLabel(/password/i)` matched both the password input and the show/hide-password button. I changed it to the exact label `/^password\*?$/i`.
2. **Wrong login button name.** The guessed `/log in|sign in/` didn't match. `error-context.md` showed the button is named `"Login"`, so I switched to an exact match.
3. **TC-02 failed: expected Invited, received Pending.** The invite is sent (after a reload the status is Invited and the counter shows 1). The test now reloads before asserting so it checks the saved state. When I later checked by hand, I could **not** reproduce the stale status, so I downgraded **BUG-01** to intermittent and timing-related.

## My changes and judgment calls

- Dropped inbox/email verification from automation and limited assertions to what the UI shows, to keep the suite simple and reliable.
- Stopped at 4 automated tests, adding Suspend as the 4th so that every status reachable without an inbox is covered.
- Treated login as a setup step, not a test case, since it is outside the Manage Users scope.
- Broke the Suspend assertion on purpose to confirm the suite catches failures before trusting the green runs.
- Re-tested the AI-reported bugs by hand: confirmed BUG-02 and BUG-03 (and that Send email invite stays enabled for suspended users), but could not reproduce BUG-01, so I downgraded it to intermittent.
- Lowered TC-11 (Bulk Upload) to P3 because it's a convenience feature; admins can still add users one by one.
- Ran TC-12 (search, filter, Clear Filters) manually and recorded the results in the test plan.

## Authorship

Code and docs were drafted by Claude. I edited test comments and this file myself, and made every judgment call on scope and the test plan: re-testing the reported bugs, downgrading BUG-01, removing a bug I chose not to report, and stopping at 4 tests.

## Main prompts (in order, lightly paraphrased)

1. "Analyze and review the doc, create a plan and help me execute it step by step."
2. "Create tests for Add User and Bulk Invite for now."
3. "Log in to Chrome and navigate." (Claude explored the app in my browser.)
4. "Don't worry about checking Gmail. Whatever is automatable from the UI, automate simply."
5. "What does the deliverable state, and what is the best approach from here?" (This led to stopping at 4 tests.)
6. "Start with Suspend in Chrome."
7. "Create the test plan." / "Write AI_USAGE.md." / "Make it more precise and readable."
8. "There should be one screenshot verifying the criteria for each test."
9. "Move the auth setup to a separate folder."
10. "Update the notes" (after my manual bug re-test) / "Remove one of the reported bugs from the plan."

## Copyright

No third-party code was copied. The only dependency is Playwright (Apache-2.0); all code was written for this assessment.
