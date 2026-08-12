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
