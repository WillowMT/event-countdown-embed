# Event Countdown Embed

A polished, standalone countdown for Notion and any iframe-capable site. Every event is configured in its URL—there is no account, database, cookie, backend, or third-party asset.

## Create a countdown URL

Start with the production URL and provide an absolute ISO 8601 timestamp with `Z` or an explicit offset:

```text
https://event-countdown-embed.pages.dev/?title=My%20Birthday&date=2026-12-01T18%3A00%3A00%2B07%3A00&accent=pink&message=See%20you%20there%21
```

The example is 6:00 PM in Bangkok (`+07:00`). The timezone is required so every viewer sees the same instant; date-only and timezone-less timestamps are intentionally rejected.

| Parameter | Required | Default | Details |
| --- | --- | --- | --- |
| `date` | Yes | — | ISO 8601 timestamp ending in `Z` or `±HH:MM`, e.g. `2026-12-01T18:00:00+07:00`. |
| `title` | No | `Countdown` | Event title. Whitespace is trimmed and output is length-limited. |
| `message` | No | omitted | Supporting text beneath the title. |
| `accent` | No | `lavender` | One of `pink`, `peach`, `yellow`, `mint`, `blue`, or `lavender`; unknown values use lavender. |
| `compact` | No | `false` | Only the literal `true` hides title/message and reduces padding. |

User-provided text is rendered as text, never HTML.

## Embed in Notion

1. Build a configured URL using the table above.
2. Paste it onto a Notion page.
3. Choose **Embed**.

## General iframe embed

```html
<div style="max-width: 720px; height: 360px;">
  <iframe
    title="My event countdown"
    src="https://event-countdown-embed.pages.dev/?title=My%20Birthday&date=2026-12-01T18%3A00%3A00%2B07%3A00&accent=pink"
    style="width: 100%; height: 100%; border: 0; border-radius: 16px;"
  ></iframe>
</div>
```

For short cards, append `&compact=true` and use a smaller iframe height.

## Local development and checks

```bash
npm run check
python3 -m http.server 8788 --directory public
```

Then open a configured URL at `http://localhost:8788/`.

## Cloudflare Pages deployment

Deploy the `public` directory to the Pages project:

```bash
wrangler pages deploy public --project-name event-countdown-embed --branch main
```

Use the stable production alias (`https://event-countdown-embed.pages.dev/`) in embeds rather than a deployment-hash URL.
