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

test('normalizes bounded text, recognized accents, and literal compact mode', () => {
  const title = `  ${'T'.repeat(130)}  `;
  const message = `  ${'M'.repeat(350)}  `;
  const config = parseConfiguration(
    new URLSearchParams(
      `date=2026-12-01T18:00:00Z&title=${title}&message=${message}&accent=mint&compact=true`,
    ),
  );

  assert.equal(config.title.length, 120);
  assert.equal(config.message.length, 300);
  assert.equal(config.accent, 'mint');
  assert.equal(config.compact, true);
  assert.equal(
    parseConfiguration(new URLSearchParams('date=2026-12-01T18:00:00Z&compact=TRUE')).compact,
    false,
  );
});

test('accepts each documented accent', () => {
  for (const accent of ['pink', 'peach', 'yellow', 'mint', 'blue', 'lavender']) {
    assert.equal(
      parseConfiguration(new URLSearchParams(`date=2026-12-01T18:00:00Z&accent=${accent}`)).accent,
      accent,
    );
  }
});
