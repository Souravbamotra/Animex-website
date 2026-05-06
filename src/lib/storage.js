/* ANIMEX v5 — LOCAL STORAGE WRAPPERS */

export function safeGet(key, fallback = '[]') {
  try { return JSON.parse(localStorage.getItem(key) || fallback); }
  catch { return JSON.parse(fallback); }
}

export function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn('Storage failed:', e); }
}

export function safeRemove(key) {
  try { localStorage.removeItem(key); }
  catch {}
}
