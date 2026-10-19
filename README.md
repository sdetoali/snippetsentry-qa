# SnippetSentry QA Assessment: Manage Users

Test plan and UI automation for the **Manage Users** page of `https://dev.snippetsentry.com`.

| File | What it is |
|---|---|
| [`TEST_PLAN.md`](TEST_PLAN.md) | Part 1: status model, 13 test cases, non-functional coverage, bugs found |
| `tests/` | Part 2: TC-01 to TC-04 automated with Playwright + TypeScript |
| [`AI_USAGE.md`](AI_USAGE.md) | How AI was used |

## Setup

Requires Node 20.12+ and a SnippetSentry admin login.

```bash
npm install
npx playwright install chromium
cp .env.example .env   # Windows: copy .env.example .env; then fill in SS_EMAIL and SS_PASSWORD
```

## Run

```bash
npx playwright test            # headless; 1 setup step + 4 tests
npx playwright test --headed   # watch it run
npx playwright show-report     # HTML report with an evidence screenshot per test
```

Each run creates users with plus-addressed emails based on `SS_EMAIL` (e.g. `you+bulk1729…@gmail.com`), so invites go to your own inbox. Every test deletes the users it created, even if it fails.

## Debugging

- Add `await page.pause();` just before the failing line and run with `--headed`: the test stops there and opens the Playwright Inspector to inspect the page and try locators (remove it before committing). `npx playwright test --debug` does the same from the first step.
- `npx playwright show-trace test-results/<test>/trace.zip` for a full replay of a failed run (traces are kept on failure)
- `error-context.md` in `test-results/` lists the page's accessible elements at the moment of failure
- Failure screenshots are attached to the HTML report automatically

## Layout

```
setup/auth.setup.ts      logs in once and saves the session (a prerequisite, not a test case)
tests/*.spec.ts          one file per feature; titles start with the test plan ID
pages/users-page.ts      page object: locators and actions for the Users page
fixtures.ts              provides `usersPage` to each test and handles cleanup
utils/test-data.ts       unique email generator
```

## Design choices

- **Minimal dependencies.** `@playwright/test`, plus `@types/node` for editor types. `.env` is loaded with Node's built-in `process.loadEnvFile()`, so no dotenv.
- **Log in once.** A setup project saves `storageState`, so each test starts already authenticated.
- **Page object plus fixture.** The page object keeps locators out of the tests. The fixture handles setup and teardown, so tests contain only steps and assertions.
- **Stable locators.** Role and label locators first, then the app's own `data-testid` attributes. No CSS or XPath.
- **No false positives.** Status is asserted on the status cell, not the whole row, so a user named "Pending" can't fake a pass. Each assertion was deliberately broken once to confirm it fails.
- **`workers: 1`.** All tests share one dev account and user list, so they run one at a time.
- **Minimal comments.** Names explain the *what* (`statusOf`, `suspendUser`); comments only explain a non-obvious *why*.
