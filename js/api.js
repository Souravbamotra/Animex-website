/*═══════════════════════════════════════════
   ANIMEX v4 — API LAYER
   Fetch with TTL cache (5 min), size limit (100 entries)
══════════════════════════════════════════*/

const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;
const API_MIN_INTERVAL = 450;
let apiQueue = Promise.resolve();
let lastApiRequestAt = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scheduleApiRequest(task) {
  const run = apiQueue.then(async () => {
    const wait = Math.max(0, API_MIN_INTERVAL - (Date.now() - lastApiRequestAt));
    if (wait) await sleep(wait);
    lastApiRequestAt = Date.now();
    return task();
  });
  apiQueue = run.catch(() => {});
  return run;
}

async function fetchAPI(endpoint) {
  const cached = S.cache[endpoint];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await scheduleApiRequest(() => fetch(API_BASE + endpoint));
      if (res.status === 429 || res.status >= 500) {
        throw new Error(res.status);
      }
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();

      // Enforce cache size limit (LRU-ish: delete oldest)
      const keys = Object.keys(S.cache);
      if (keys.length >= MAX_CACHE_SIZE) {
        const oldest = keys.reduce((a, b) => S.cache[a].timestamp < S.cache[b].timestamp ? a : b);
        delete S.cache[oldest];
      }
      S.cache[endpoint] = { data: d, timestamp: Date.now() };
      return d;
    } catch (e) {
      if (attempt === 2) {
        console.error('API:', endpoint, e);
        return null;
      }
      await sleep(700 * (attempt + 1));
    }
  }
  return null;
}

function detectPlatforms(anime) {
  let platforms = [];
  if (anime.streaming?.length) {
    anime.streaming.forEach(s => {
      const n = s.name.toLowerCase();
      if (n.includes('netflix')) platforms.push({key:'netflix',url:s.url});
      else if (n.includes('crunchyroll')) platforms.push({key:'crunchyroll',url:s.url});
      else if (n.includes('prime')||n.includes('amazon')) platforms.push({key:'prime',url:s.url});
      else if (n.includes('disney')) platforms.push({key:'disney',url:s.url});
      else if (n.includes('hidive')) platforms.push({key:'hidive',url:s.url});
      else if (n.includes('youtube')) platforms.push({key:'youtube',url:s.url});
    });
  }
  if (!platforms.length) {
    const tl = (anime.title||'').toLowerCase();
    for (const [k,pks] of Object.entries(PLATFORM_DB)) {
      if (tl.includes(k)) {
        pks.forEach(pk=>{
          if(!platforms.find(p=>p.key===pk))
            platforms.push({key:pk,url:PLATFORMS[pk].searchUrl(anime.title),fallback:true});
        });
        break;
      }
    }
  }
  if (!platforms.length) platforms = [
    {key:'crunchyroll',url:PLATFORMS.crunchyroll.searchUrl(anime.title),fallback:true},
    {key:'youtube',url:PLATFORMS.youtube.searchUrl(anime.title),fallback:true}
  ];
  return platforms;
}
