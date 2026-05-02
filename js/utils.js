/*═══════════════════════════════════════════
   ANIMEX v4 — UTILITIES
   Sanitization, helpers, focus trap
══════════════════════════════════════════*/

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function safeImage(url, alt) {
  const safeUrl = escapeHtml(url || '');
  const safeAlt = escapeHtml(alt || '');
  return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%23101018%22 width=%22300%22 height=%22450%22/%3E%3Ctext fill=%22%23ffffff%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E';this.onerror=null;">`;
}

function smoothNav(e, id) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior: 'smooth'});
}

function trapFocus(element) {
  const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  element.addEventListener('keydown', function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  });
}

function releaseFocusTrap(element) {
  const clone = element.cloneNode(true);
  element.parentNode.replaceChild(clone, element);
}
