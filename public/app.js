const ALLOWED_ACCENTS = new Set(['pink', 'peach', 'yellow', 'mint', 'blue', 'lavender']);
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 300;
const ISO_WITH_TIMEZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
const EXAMPLE_URL = 'https://event-countdown-embed.pages.dev/?title=My%20Birthday&date=2026-12-01T18%3A00%3A00%2B07%3A00&accent=pink';

function boundedText(value, maxLength) {
  return (value ?? '').trim().slice(0, maxLength);
}

function isValidIsoTimestamp(date) {
  if (!ISO_WITH_TIMEZONE.test(date)) return false;

  const [calendarDate, timeWithOffset] = date.split('T');
  const [year, month, day] = calendarDate.split('-').map(Number);
  const time = timeWithOffset.slice(0, timeWithOffset.endsWith('Z') ? -1 : -6);
  const [hours, minutes, seconds = '0'] = time.split(':');
  const numericSeconds = Number(seconds.split('.')[0]);
  const offsetMatch = timeWithOffset.match(/([+-])(\d{2}):(\d{2})$/);
  const offsetHours = offsetMatch ? Number(offsetMatch[2]) : null;
  const offsetMinutes = offsetMatch ? Number(offsetMatch[3]) : null;
  const hasUnknownLocalOffset = offsetMatch?.[1] === '-' && offsetHours === 0 && offsetMinutes === 0;
  const hasValidOffset = !offsetMatch
    || (!hasUnknownLocalOffset && offsetHours <= 14 && offsetMinutes <= 59
      && (offsetHours !== 14 || offsetMinutes === 0));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth
    && Number(hours) <= 23 && Number(minutes) <= 59 && numericSeconds <= 59
    && hasValidOffset;
}

export function parseConfiguration(params) {
  const date = params.get('date')?.trim();
  if (!date || !isValidIsoTimestamp(date)) {
    return { ok: false, error: 'Add a valid event date with an explicit timezone.' };
  }

  const targetMs = Date.parse(date);
  if (!Number.isFinite(targetMs)) {
    return { ok: false, error: 'Add a valid event date with an explicit timezone.' };
  }

  const requestedAccent = params.get('accent');
  return {
    ok: true,
    targetMs,
    title: boundedText(params.get('title'), MAX_TITLE_LENGTH) || 'Countdown',
    message: boundedText(params.get('message'), MAX_MESSAGE_LENGTH),
    accent: ALLOWED_ACCENTS.has(requestedAccent) ? requestedAccent : 'lavender',
    compact: params.get('compact') === 'true',
  };
}

export function getCountdownState(targetMs, nowMs = Date.now()) {
  if (targetMs <= nowMs) return { state: 'elapsed' };

  let remainingSeconds = Math.ceil((targetMs - nowMs) / 1000);
  const days = Math.floor(remainingSeconds / 86_400);
  remainingSeconds %= 86_400;
  const hours = Math.floor(remainingSeconds / 3_600);
  remainingSeconds %= 3_600;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return { state: 'counting', days, hours, minutes, seconds };
}

function element(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createCard(accent, compact = false) {
  const card = element('section', `countdown-card${compact ? ' countdown-card--compact' : ''}`);
  card.dataset.accent = accent;
  return card;
}

function renderConfigurationError(app, error) {
  const card = createCard('lavender');
  const panel = element('section', 'status-panel');
  panel.setAttribute('role', 'alert');
  panel.append(element('h1', '', 'Countdown configuration needed'));
  panel.append(element('p', '', error));
  const example = element('a', 'example-link', EXAMPLE_URL);
  example.href = EXAMPLE_URL;
  panel.append(element('p', '', 'Use a timestamp with Z or an explicit offset, for example:'));
  panel.append(example);
  card.append(panel);
  app.replaceChildren(card);
}

function renderElapsed(app, config) {
  const card = createCard(config.accent, config.compact);
  const panel = element('section', 'status-panel');
  const status = element('h1', '', 'The event has started');
  status.setAttribute('aria-live', 'polite');
  panel.append(status);
  card.append(panel);
  app.replaceChildren(card);
}

function formatTargetDate(targetMs) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(targetMs);
}

function renderCountdown(app, config, countdown) {
  const card = createCard(config.accent, config.compact);
  if (!config.compact) {
    const heading = element('header', 'event-heading');
    heading.append(element('h1', 'event-title', config.title));
    if (config.message) heading.append(element('p', 'event-message', config.message));
    card.append(heading);
  }

  const grid = element('section', 'countdown-grid');
  grid.setAttribute('aria-label', 'Time remaining');
  for (const [label, value] of [['Days', countdown.days], ['Hours', countdown.hours], ['Minutes', countdown.minutes], ['Seconds', countdown.seconds]]) {
    const unit = element('div', 'countdown-unit');
    unit.append(element('span', 'countdown-value', label === 'Days' ? String(value) : String(value).padStart(2, '0')));
    unit.append(element('span', 'countdown-label', label));
    grid.append(unit);
  }
  card.append(grid);
  if (!config.compact) card.append(element('p', 'target-date', `Event time: ${formatTargetDate(config.targetMs)}`));
  app.replaceChildren(card);
}

function startApp() {
  const app = document.querySelector('#app');
  if (!app) return;
  const config = parseConfiguration(new URLSearchParams(window.location.search));
  if (!config.ok) return renderConfigurationError(app, config.error);

  let intervalId;
  const render = () => {
    const countdown = getCountdownState(config.targetMs);
    if (countdown.state === 'elapsed') {
      renderElapsed(app, config);
      if (intervalId) window.clearInterval(intervalId);
      return;
    }
    renderCountdown(app, config, countdown);
  };
  render();
  intervalId = window.setInterval(render, 1000);
  window.addEventListener('pagehide', () => window.clearInterval(intervalId), { once: true });
}

if (typeof document !== 'undefined') startApp();
