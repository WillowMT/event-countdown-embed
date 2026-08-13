const ACCENTS = new Set(['pink', 'peach', 'yellow', 'mint', 'blue', 'lavender']);

export function buildCountdownUrl({ title = '', message = '', date, time, accent = 'lavender', compact = false }, origin = window.location.origin) {
  if (!date || !time) throw new Error('An event date and time are required.');
  const params = new URLSearchParams();
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();
  if (cleanTitle) params.set('title', cleanTitle);
  if (cleanMessage) params.set('message', cleanMessage);
  params.set('date', `${date}T${time}:00+07:00`);
  params.set('accent', ACCENTS.has(accent) ? accent : 'lavender');
  if (compact) params.set('compact', 'true');
  return `${origin.replace(/\/$/, '')}/?${params}`;
}

function showResult(result, url) {
  result.hidden = false;
  result.querySelector('#generated-url').value = url;
}

function startGenerator() {
  const form = document.querySelector('#generator-form');
  if (!form) return;
  const result = document.querySelector('#generator-result');
  const error = document.querySelector('#generator-error');
  const output = document.querySelector('#generated-url');
  const copy = document.querySelector('#copy-url');
  const preview = document.querySelector('#open-preview');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.hidden = true;
    try {
      const data = Object.fromEntries(new FormData(form));
      const url = buildCountdownUrl({ ...data, compact: form.compact.checked }, window.location.origin);
      showResult(result, url);
      preview.href = url;
    } catch (exception) {
      error.textContent = exception.message;
      error.hidden = false;
      result.hidden = true;
    }
  });

  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    copy.textContent = 'Copied!';
    window.setTimeout(() => { copy.textContent = 'Copy link'; }, 1600);
  });
}

if (typeof document !== 'undefined') startGenerator();
