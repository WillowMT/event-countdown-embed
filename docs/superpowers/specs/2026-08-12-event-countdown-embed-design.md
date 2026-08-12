# Event Countdown Embed — Design Specification

**Date:** 2026-08-12  
**Status:** Approved design; implementation pending written-spec review

## 1. Goal

Deliver a reusable, publicly hosted event countdown that can be embedded into Notion and other iframe-capable web applications. Each event is configured entirely by the URL; no account, database, editor, or server-side state is required.

## 2. Scope

### Included

- A static Cloudflare Pages application.
- Live countdown in days, hours, minutes, and seconds.
- URL parameters for event configuration.
- Calm pastel, high-legibility design that is responsive in common embed sizes and mobile viewports.
- An elapsed state after the target time.
- Documentation with examples suitable for Notion embeds and general iframe use.
- Production deployment, HTTP verification, interaction checks, and visual desktop/mobile QA.

### Excluded

- Event persistence, accounts, authentication, database storage, calendars, notifications, and a visual configuration dashboard.
- A backend API or secret configuration.

## 3. URL Contract

The canonical app URL is the Cloudflare Pages production URL followed by query parameters.

Required:

- `date`: URL-encoded ISO 8601 timestamp **with an explicit timezone offset or `Z`**. Example: `2026-12-01T18:00:00%2B07:00`.

Optional:

- `title`: Event title. Default: `Countdown`.
- `message`: Supporting text under the title. Default: omitted.
- `accent`: named pastel accent (`pink`, `peach`, `yellow`, `mint`, `blue`, `lavender`). Default: `lavender`.
- `compact`: `true` hides the title/message area and reduces padding for small embeds. Default: `false`.

Example:

```text
https://event-countdown-embed.pages.dev/?title=My%20Birthday&date=2026-12-01T18%3A00%3A00%2B07%3A00&accent=pink&message=See%20you%20there%21
```

Invalid/missing dates show an explicit configuration error and an example URL rather than a misleading countdown. Ambiguous date-only or timezone-less timestamps are rejected.

## 4. User Experience

The app renders a centered, soft pastel card with:

1. Optional title and supporting message.
2. Four clearly labeled countdown units: days, hours, minutes, seconds.
3. A subtle target-date label rendered in the viewer's locale and timezone.
4. A completion panel reading `The event has started` once the clock reaches zero.

The countdown updates every second. It derives remaining time from the current time on each tick, preventing accumulated timer drift. The timer is cleared when the page unloads.

Visual system:

- Light background with a gentle accent-tinted gradient.
- Dark slate text and strong contrast for readability.
- Large tabular numerals, clear labels, rounded corners, and restrained shadows.
- No third-party scripts, fonts, trackers, or cookies.
- Respect `prefers-reduced-motion`; decorative motion is omitted.

## 5. Architecture and Boundaries

A standalone repository will contain a self-contained static frontend:

- `public/index.html`: semantic document shell and live region.
- `public/styles.css`: theme tokens, responsive layout, and accessibility styles.
- `public/app.js`: URL parsing/validation, state calculation, rendering, timer lifecycle.
- `README.md`: URL parameters, Notion instructions, iframe examples, local preview/deploy commands.
- `wrangler.jsonc`: Cloudflare Pages project metadata/deployment configuration if needed by CLI workflow.

No Worker, API routes, database, or secrets exist. Cloudflare Pages serves the static directory. Configuration enters only through `URLSearchParams`; renderer functions receive a normalized configuration object rather than reading the URL directly.

## 6. Validation and Error Handling

- Accept only parseable ISO timestamps containing `Z` or an explicit `±HH:MM` offset.
- Trim title and message; cap each to prevent abusive layout sizes.
- Map unrecognized accent values to the default lavender theme.
- Treat `compact` as true only for the literal value `true`.
- Never inject raw parameter content with `innerHTML`; render user-provided text with `textContent`.
- Invalid configuration results in an accessible, visible error state with a sanitized sample URL.

## 7. Testing and Verification

Before deployment:

- Run JavaScript syntax validation.
- Test URL parsing/validation for valid offset/Z timestamps, missing dates, timezone-less dates, invalid dates, recognized/fallback accents, and compact mode.
- Manually exercise live countdown and zero-state rendering with a near-future timestamp.

After Cloudflare Pages deployment:

- Verify production alias serves HTTP 200 and `text/html` content type with a recognizable title.
- Verify a configured URL renders correct title, target time, and units.
- Verify an expired target displays the completion panel.
- Verify invalid date shows configuration error.
- Visually inspect the production page at desktop and narrow mobile dimensions, including compact mode.
- Verify the Notion-compatible public URL is HTTPS and frame-embeddable (no restrictive `X-Frame-Options` or `frame-ancestors` policy).

## 8. Deployment and Repository

The application will use a new public GitHub repository under `WillowMT`, because it has an independent public URL and release lifecycle. It will be deployed to a new Cloudflare Pages project using Wrangler. The user-facing link will be the stable Cloudflare Pages project alias, such as `https://event-countdown-embed.pages.dev/`, not a provisional deployment-hash URL.

## 9. Success Criteria

- A user can generate a distinct event countdown by editing a URL only.
- The link works as a normal page and inside common embed surfaces such as Notion.
- Countdown values are accurate to the given absolute timestamp.
- The UI is polished, pastel, readable, and usable on mobile.
- No personal data, credentials, state, or external dependency is required.
