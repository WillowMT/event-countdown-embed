import test from 'node:test';
import assert from 'node:assert/strict';
import { getCountdownState } from '../public/app.js';

test('splits remaining milliseconds into countdown units', () => {
  const duration = (((2 * 24 + 3) * 60 + 4) * 60 + 5) * 1000;

  assert.deepEqual(getCountdownState(duration, 0), {
    state: 'counting',
    days: 2,
    hours: 3,
    minutes: 4,
    seconds: 5,
  });
});

test('uses elapsed state at and past the target', () => {
  assert.equal(getCountdownState(1000, 1000).state, 'elapsed');
  assert.equal(getCountdownState(1000, 1001).state, 'elapsed');
});

test('rounds a future sub-second remainder up to one displayed second', () => {
  assert.deepEqual(getCountdownState(1, 0), {
    state: 'counting', days: 0, hours: 0, minutes: 0, seconds: 1,
  });
  assert.deepEqual(getCountdownState(999, 0), {
    state: 'counting', days: 0, hours: 0, minutes: 0, seconds: 1,
  });
  assert.deepEqual(getCountdownState(1000, 0), {
    state: 'counting', days: 0, hours: 0, minutes: 0, seconds: 1,
  });
});
