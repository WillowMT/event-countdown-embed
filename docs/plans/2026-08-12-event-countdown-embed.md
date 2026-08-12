# Event Countdown Embed Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build and deploy a polished, URL-configured static event countdown that embeds cleanly in Notion and other web apps.

**Architecture:** A zero-backend Cloudflare Pages site serves three static frontend files. `app.js` normalizes URL parameters into a safe configuration object, calculates absolute remaining time every tick, and renders countdown/error/completion states through DOM APIs only. CSS supplies the pastel theme system and responsive embed layout.

**Tech Stack:** HTML5, CSS3, browser JavaScript (ES modules), Node built-in test runner, Wrangler/Cloudflare Pages, GitHub.

---

### Task 1: Establish static app and test harness

**Objective:** Add the minimal project structure and a repeatable built-in JavaScript test command.

**Files:**
- Create: `package.json`
- Create: `public/index.html`
- Create: `public/styles.css`
- Create: `public/app.js`
- Create: `tests/config.test.js`

**Step 1: Write the failing test**

Create `tests/config.test.js` importing `parseConfiguration` from `public/app.js`, then add a first test:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseConfiguration } from '../public/app.js';

test('uses defaults while accepting a valid offset timestamp', () => {
  const config = parseConfiguration(
    new URLSearchParams('date=2026-12-01T18%3A00%3A00%2B07%3A00'),
  );
  assert.equal(config.ok, true);
  assert.equal(config.title, 'Countdown');
  assert.equal(config.accent, 'lavender');
});
```

**Step 2: Run test to verify failure**

Run: `node --test tests/config.test.js`

Expected: FAIL because `app.js` does not export `parseConfiguration` yet.

**Step 3: Add minimal structure**

Create `package.json`:

```json
{
  "name": "event-countdown-embed",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "check": "node --check public/app.js && node --test"
  }
}
```

Create a semantic `public/index.html` with title `Event Countdown`, a `<main id="app" aria-live="polite">`, and `<script type="module" src="./app.js"></script>`. Add empty `styles.css`; make `app.js` export a temporary `parseConfiguration` returning the expected fields.

**Step 4: Run test to verify pass**

Run: `npm test`

Expected: `1` passing test.

**Step 5: Commit**

```bash
git add package.json public tests
git commit -m "chore: scaffold static countdown app"
```

### Task 2: Implement and test URL configuration normalization

**Objective:** Safely parse the public URL contract and return a normalized config/error result.

**Files:**
- Modify: `public/app.js`
- Modify: `tests/config.test.js`

**Step 1: Write failing tests**

Add coverage for:

```js
test('rejects missing and timezone-less date values', () => {
  assert.equal(parseConfiguration(new URLSearchParams()).ok, false);
  assert.equal(
    parseConfiguration(new URLSearchParams('date=2026-12-01T18:00:00')).ok,
    false,
  );
});

test('accepts UTC Z timestamps and falls back for unknown accents', () => {
  const config = parseConfiguration(
    new URLSearchParams('date=2026-12-01T18:00:00Z&accent=neon'),
  );
  assert.equal(config.ok, true);
  assert.equal(config.accent, 'lavender');
});
```

Also test title/message trimming and length caps, the six allowed accents, and that `compact` becomes true only for `compact=true`.

**Step 2: Run tests to verify failure**

Run: `npm test`

Expected: FAIL for missing timezone validation and fallback behavior.

**Step 3: Implement minimal parser**

In `public/app.js`, define constants for allowed accents and max lengths. Implement `parseConfiguration(params)` that:

- Rejects absent/malformed dates and values lacking `Z` or `±HH:MM` suffix.
- Uses `Date.parse` only after timezone format validation, and rejects non-finite results.
- Produces `{ ok: true, targetMs, title, message, accent, compact }` or `{ ok: false, error }`.
- Uses `String.prototype.trim()` and bounded `slice()` for title/message.

Keep DOM startup separate from exported pure helpers so Node tests never require a browser global.

**Step 4: Run test and syntax checks**

Run: `npm run check`

Expected: all configuration tests pass and `node --check` exits 0.

**Step 5: Commit**

```bash
git add public/app.js tests/config.test.js
git commit -m "feat: validate URL countdown configuration"
```

### Task 3: Implement and test countdown time calculation

**Objective:** Calculate stable countdown units and correctly distinguish active versus elapsed events.

**Files:**
- Modify: `public/app.js`
- Create: `tests/countdown.test.js`

**Step 1: Write failing tests**

Import an exported `getCountdownState(targetMs, nowMs)` and test exact conversion:

```js
test('splits remaining milliseconds into countdown units', () => {
  const duration = (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000;
  assert.deepEqual(getCountdownState(duration, 0), {
    state: 'counting', days: 2, hours: 3, minutes: 4, seconds: 5,
  });
});

test('uses elapsed state at and past the target', () => {
  assert.equal(getCountdownState(1000, 1000).state, 'elapsed');
  assert.equal(getCountdownState(1000, 1001).state, 'elapsed');
});
```

**Step 2: Run test to verify failure**

Run: `node --test tests/countdown.test.js`

Expected: FAIL because `getCountdownState` is not exported.

**Step 3: Implement minimal helper**

Implement `getCountdownState(targetMs, nowMs = Date.now())` using `Math.max(0, targetMs - nowMs)` and floor division. Return only numeric integer units. Do not decrement state from a previous render; each tick must calculate fresh from wall-clock time.

**Step 4: Run test to verify pass**

Run: `npm run check`

Expected: all test files pass.

**Step 5: Commit**

```bash
git add public/app.js tests/countdown.test.js
git commit -m "feat: calculate stable event countdown state"
```

### Task 4: Build accessible pastel render states

**Objective:** Render the configured countdown, elapsed panel, and invalid-configuration error without unsafe HTML injection.

**Files:**
- Modify: `public/index.html`
- Modify: `public/styles.css`
- Modify: `public/app.js`

**Step 1: Define visual acceptance checks before styling**

Use this DOM structure from `app.js`: a `.countdown-card`, optional `.event-heading`, `.countdown-grid` containing four `time` elements with labels, and state panels. Populate title/message with `textContent`, never `innerHTML`. Add `aria-live="polite"` only to a concise status text, rather than making each second read aloud.

**Step 2: Implement the renderers**

Implement isolated renderer functions such as `renderConfigurationError`, `renderCountdown`, and `renderElapsed`. Format units to two digits except days; format the target via `Intl.DateTimeFormat` in the viewer locale. For the error state, show a safe static example URL as a text link.

Initialize from `new URLSearchParams(window.location.search)` only in browser startup. If valid, render immediately then use `window.setInterval(render, 1000)`; clear the timer after elapsed state and on `pagehide`.

**Step 3: Add pastel/responsive CSS**

Define per-accent custom-property themes on `data-accent`, using a light gradient background and dark slate foreground. Include `font-variant-numeric: tabular-nums`, responsive grid collapse under roughly 480px, visible focus styles, `min-height` appropriate to embeds, and a `prefers-reduced-motion` media query that disables transitions.

**Step 4: Verify locally**

Run:

```bash
npm run check
python3 -m http.server 8788 --directory public
```

Open `http://localhost:8788/?title=Test&date=2026-12-01T18%3A00%3A00%2B07%3A00&accent=mint` in a browser and verify title/message, four units, target date, accent, and narrow layout. Test an expired timestamp and a missing `date` URL separately. Stop the server after inspection.

Expected: configuration/clock tests pass, and all three UI states are readable.

**Step 5: Commit**

```bash
git add public/index.html public/styles.css public/app.js
git commit -m "feat: render accessible pastel countdown embed"
```

### Task 5: Add deployment configuration and user documentation

**Objective:** Make the static app straightforward to deploy and configure in Notion/web iframes.

**Files:**
- Create: `wrangler.jsonc`
- Create: `README.md`

**Step 1: Add Pages deployment metadata**

Create `wrangler.jsonc`:

```jsonc
{
  "name": "event-countdown-embed",
  "compatibility_date": "2026-08-12",
  "pages_build_output_dir": "./public"
}
```

**Step 2: Write README**

Document:

- Live URL pattern and a complete Bangkok (`+07:00`) example.
- Each URL parameter/default/allowed value.
- Why the timezone must be explicit.
- Notion instructions: paste configured public URL then select **Embed**.
- General iframe sample with a responsive fixed-height wrapper.
- Local preview (`python3 -m http.server 8788 --directory public`) and test command (`npm run check`).
- Cloudflare Pages deployment command and the stable alias expectation.

**Step 3: Verify docs and config**

Run:

```bash
npm run check
node -e "JSON.parse(require('node:fs').readFileSync('wrangler.jsonc','utf8').replace(/\/\/.*$/gm,'')); console.log('valid config')"
```

Expected: checks pass and `valid config` prints.

**Step 4: Commit**

```bash
git add README.md wrangler.jsonc
git commit -m "docs: add embed and deployment guidance"
```

### Task 6: Deploy to Cloudflare Pages and verify the public artifact

**Objective:** Publish the stable public app and prove it functions and embeds correctly.

**Files:**
- Modify only if deployment verification discovers a defect.

**Step 1: Ensure Pages project exists**

Run:

```bash
wrangler pages project create event-countdown-embed --production-branch main
```

If the project already exists, continue rather than recreating it.

**Step 2: Deploy production files**

Run:

```bash
wrangler pages deploy public --project-name event-countdown-embed --branch main
```

Record the deployment URL only for diagnostics; user-facing output must use the stable production alias.

**Step 3: Verify real production HTTP delivery**

Run:

```bash
curl -sSIL https://event-countdown-embed.pages.dev/
curl -sS https://event-countdown-embed.pages.dev/ | grep -F '<title>Event Countdown</title>'
curl -sSIL https://event-countdown-embed.pages.dev/ | grep -Ei 'x-frame-options|content-security-policy' || true
```

Expected: HTTP 200, HTML content type, expected title, and no framing restriction that blocks Notion.

**Step 4: Browser-test production URLs**

Open a future configured URL, an expired URL, invalid-date URL, and compact URL at desktop and narrow mobile dimensions. Confirm active units tick, elapsed/error messages appear, the pastel layout is not clipped, and iframe embedding is permitted. Use a cache-busting query parameter if edge propagation shows an old asset revision.

**Step 5: Commit/fix only if necessary**

If no source changes are needed, no new commit is required. If a defect is fixed, run `npm run check`, commit the targeted fix, redeploy, and repeat the production verification.

### Task 7: Push and verify repository state

**Objective:** Ensure the published source and public URL are traceable and clean.

**Files:**
- No planned source edits.

**Step 1: Push commits**

Run:

```bash
git push origin main
git status --short --branch
```

Expected: `main...origin/main` with no uncommitted files.

**Step 2: Verify remote source**

Run:

```bash
gh api repos/WillowMT/event-countdown-embed/contents/README.md?ref=main --jq .path
gh repo view WillowMT/event-countdown-embed --json url,visibility --jq '"Repository: " + .url + "\nVisibility: " + .visibility'
```

Expected: `README.md` path exists and repository reports public visibility.

**Step 3: Final delivery**

Report the stable Pages URL, GitHub repository URL, a ready-to-copy event URL example, and clarify that all state is in the URL with no database or account.
