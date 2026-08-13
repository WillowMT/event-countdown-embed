import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCountdownUrl } from '../public/generator.js';

test('builds an encoded countdown URL with Bangkok offset', () => {
  const url = buildCountdownUrl({
    title: 'Graduation Day',
    message: 'See you there!',
    date: '2027-12-01',
    time: '18:00',
    accent: 'mint',
    compact: false,
  }, 'https://event-countdown-embed.pages.dev');

  assert.equal(
    url,
    'https://event-countdown-embed.pages.dev/?title=Graduation+Day&message=See+you+there%21&date=2027-12-01T18%3A00%3A00%2B07%3A00&accent=mint',
  );
});

test('omits empty text and adds literal compact mode', () => {
  const url = buildCountdownUrl({
    title: '', message: '', date: '2027-12-01', time: '08:30', accent: 'lavender', compact: true,
  }, 'https://example.test');

  assert.equal(url, 'https://example.test/?date=2027-12-01T08%3A30%3A00%2B07%3A00&accent=lavender&compact=true');
});

test('rejects missing date or time', () => {
  assert.throws(() => buildCountdownUrl({ date: '', time: '08:30' }, 'https://example.test'), /date and time/i);
  assert.throws(() => buildCountdownUrl({ date: '2027-12-01', time: '' }, 'https://example.test'), /date and time/i);
});
