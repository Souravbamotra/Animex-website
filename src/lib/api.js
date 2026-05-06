/* ANIMEX v5 — API LAYER (TTL cache, rate limiting, retry) */
import { API_BASE } from './config.js';

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 120;
const API_MIN_INTERVAL = 450;

const _cache = {};
let _apiQueue = Promise.resolve();
let _lastRequest = 0;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function scheduleRequest(task) {
  const run = _apiQueue.then(async () => {
    const wait = Math.max(0, API_MIN_INTERVAL - (Date.now() - _lastRequest));
    if (wait) await sleep(wait);
    _lastRequest = Date.now();
    return task();
  });
  _apiQueue = run.catch(() => {});
  return run;
}

export async function fetchAPI(endpoint) {
  const cached = _cache[endpoint];
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await scheduleRequest(() => fetch(API_BASE + endpoint));
      if (res.status === 429 || res.status >= 500) throw new Error(res.status);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();

      // LRU eviction
      const keys = Object.keys(_cache);
      if (keys.length >= MAX_CACHE_SIZE) {
        const oldest = keys.reduce((a, b) => _cache[a].ts < _cache[b].ts ? a : b);
        delete _cache[oldest];
      }
      _cache[endpoint] = { data, ts: Date.now() };
      return data;
    } catch (e) {
      if (attempt === 3) { console.error('API error:', endpoint, e); return null; }
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
  return null;
}
