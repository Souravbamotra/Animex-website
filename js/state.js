/*═══════════════════════════════════════════
   ANIMEX v4 — STATE MANAGEMENT
   Central state, localStorage wrappers with error handling
══════════════════════════════════════════*/

const Device = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  isLowEnd: false,
};

if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
  Device.isLowEnd = true;
}

const USE_CURSOR = !Device.isTouch && !Device.prefersReducedMotion;
const USE_PARTICLES = !Device.isMobile && !Device.isLowEnd && !Device.prefersReducedMotion;
const USE_SLASH = !Device.isTouch && !Device.prefersReducedMotion && !Device.isLowEnd;
const USE_PARALLAX = !Device.isTouch && !Device.prefersReducedMotion;

function safeStorageGet(key, fallback = '[]') {
  try { return JSON.parse(localStorage.getItem(key) || fallback); }
  catch { return JSON.parse(fallback); }
}
function safeStorageSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn('Storage failed:', e); }
}
function safeStorageRemove(key) {
  try { localStorage.removeItem(key); }
  catch {}
}

const S = {
  watchlist: safeStorageGet('animex_watchlist'),
  recent: safeStorageGet('animex_recent'),
  preferredPlatform: safeStorageGet('animex_pref', 'null'),
  discoverPage: 1,
  discoverFilter: 'all',
  currentAnime: null,
  featuredList: [],
  featuredIdx: 0,
  moodActive: null,
  quizSelections: new Set(),
  cache: {},
  discoverLoading: false,
  hasMoreDiscover: true,
  infiniteObserver: null,
  intervals: { daily: null, featured: null },
  rafs: { cursor: null, particles: null },
};

function clearAllIntervals() {
  Object.values(S.intervals).forEach(id => id && clearInterval(id));
  Object.values(S.rafs).forEach(id => id && cancelAnimationFrame(id));
}
