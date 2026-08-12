const ALLOWED_ACCENTS = new Set(['pink', 'peach', 'yellow', 'mint', 'blue', 'lavender']);
const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 300;
const ISO_WITH_TIMEZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function boundedText(value, maxLength) {
  return (value ?? '').trim().slice(0, maxLength);
}

export function parseConfiguration(params) {
  const date = params.get('date')?.trim();

  if (!date || !ISO_WITH_TIMEZONE.test(date)) {
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
