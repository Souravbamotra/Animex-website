/*═══════════════════════════════════════════
   ANIMEX v4 — MAIN APPLICATION
══════════════════════════════════════════*/

let searchTimer;
let loaderHidden = false;

function animateLoaderCounter() {
  const el = document.getElementById('loader-pct');
  let v = 0;
  const iv = setInterval(() => {
    v = Math.min(v + Math.floor(Math.random() * 8) + 2, 100);
    el.textContent = v + '%';
    if (v >= 100) clearInterval(iv);
  }, 55);
}

function hideLoader() {
  if (loaderHidden) return;
  loaderHidden = true;
  const loader = document.getElementById('loader');
  if (!loader) return;
  loader.style.opacity = '0';
  setTimeout(() => loader.style.display = 'none', 350);
}

async function loadFeatured() {
  const data = await fetchAPI('/top/anime?filter=airing&limit=10');
  if (!data?.data?.length) return;
  S.featuredList = data.data.filter(a => a.images?.jpg?.large_image_url);
  renderFeaturedDots();
  setFeatured(0);
  if (S.intervals.featured) clearInterval(S.intervals.featured);
  S.intervals.featured = setInterval(() => {
    S.featuredIdx = (S.featuredIdx + 1) % S.featuredList.length;
    setFeatured(S.featuredIdx);
  }, 7000);
  updateHeroStack();
}

function setFeatured(idx) {
  S.featuredIdx = idx;
  const anime = S.featuredList[idx];
  if (!anime) return;
  const bg = document.getElementById('hero-bg-img');
  const imgUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  bg.style.backgroundImage = `url('${imgUrl}')`;
  document.getElementById('hero-featured-label-text').textContent = 'Featured Anime · Now Airing';
  const titleMain = document.getElementById('hero-title-main');
  const titleAccent = document.getElementById('hero-title-accent');
  if (typeof gsap !== 'undefined' && !Device.prefersReducedMotion) {
    gsap.to(titleMain, {opacity:0, y:-8, duration:0.25, ease:'power2.in', onComplete: () => {
      titleMain.textContent = anime.title || 'Anime Discovery';
      gsap.to(titleMain, {opacity:1, y:0, duration:0.4, ease:'power2.out'});
    }});
    gsap.to(titleAccent, {opacity:0, y:-6, duration:0.25, delay:0.04, ease:'power2.in', onComplete: () => {
      titleAccent.textContent = anime.genres?.slice(0,2).map(g=>g.name).join(' · ') || 'Anime';
      gsap.to(titleAccent, {opacity:1, y:0, duration:0.4, ease:'power2.out'});
    }});
  } else {
    titleMain.textContent = anime.title || 'Anime Discovery';
    titleAccent.textContent = anime.genres?.slice(0,2).map(g=>g.name).join(' · ') || 'Anime';
  }
  document.getElementById('hero-title-jp').textContent = anime.title_japanese || '';
  const synopsis = anime.synopsis ? anime.synopsis.slice(0, 155) + '…' : 'Discover this amazing anime across streaming platforms.';
  document.getElementById('hero-desc').textContent = synopsis;
  document.getElementById('hero-score-val').textContent = anime.score || '—';
  document.getElementById('hero-badge-type').textContent = anime.type || 'TV';
  document.getElementById('hero-badge-year').textContent = anime.year || '2024';
  document.getElementById('hero-badge-eps').textContent = anime.episodes ? anime.episodes + ' eps' : 'Ongoing';
  S.currentFeaturedId = anime.mal_id;
  document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function renderFeaturedDots() {
  const wrap = document.getElementById('hero-dots');
  wrap.innerHTML = S.featuredList.map((_, i) =>
    `<span class="hero-dot${i===0?' active':''}" onclick="setFeatured(${i})" role="button" tabindex="0" aria-label="Featured item ${i+1}"></span>`
  ).join('');
}

function updateHeroStack() {
  const picks = S.featuredList.slice(1, 4);
  picks.forEach((a, i) => {
    const el = document.getElementById(`hsc-${i}`);
    if (!el) return;
    el.innerHTML = safeImage(a.images?.jpg?.image_url || '', a.title || '');
  });
}

function openCurrentFeatured() { if (S.currentFeaturedId) openAnime(S.currentFeaturedId); }

async function loadTrending() {
  const el = document.getElementById('trending-cards');
  el.innerHTML = renderSkeletons(8);
  const d = await fetchAPI('/top/anime?filter=airing&limit=14');
  if (!d) { el.innerHTML = '<p style="color:var(--t-dim);padding:20px">Failed to load</p>'; return; }
  el.innerHTML = d.data.map(a => renderCard(a, true)).join('');
}

async function loadTopRated() {
  const el = document.getElementById('toprated-cards');
  el.innerHTML = renderSkeletons(8);
  const d = await fetchAPI('/top/anime?limit=14');
  if (!d?.data?.length) {
    el.innerHTML = '<div class="section-empty"><p>Top Rated could not load.</p><button class="section-cta" onclick="loadTopRated()">Retry</button></div>';
    return;
  }
  el.innerHTML = d.data.map(a => renderCard(a, true)).join('');
}

let discoverData = [];
async function loadDiscover(reset = true) {
  if (S.discoverLoading) return;
  S.discoverLoading = true;
  if (reset) { S.discoverPage = 1; discoverData = []; S.hasMoreDiscover = true; }
  const el = document.getElementById('discover-cards');
  const spinner = document.getElementById('load-spinner');
  updateLoadMoreButton();
  updateDiscoverSummary();
  if (reset) el.innerHTML = renderSkeletons(12);
  else spinner.style.display = 'flex';
  const genre = document.getElementById('genre-filter').value;
  const sort = document.getElementById('sort-filter').value;
  let url = `/top/anime?limit=20&page=${S.discoverPage}`;
  if (genre) url = `/anime?genres=${genre}&order_by=${sort}&limit=20&page=${S.discoverPage}`;
  else if (S.discoverFilter === 'airing') url = `/top/anime?filter=airing&limit=20&page=${S.discoverPage}`;
  else if (S.discoverFilter === 'movie') url = `/top/anime?filter=bypopularity&type=movie&limit=20&page=${S.discoverPage}`;
  else url = `/top/anime?order_by=${sort}&limit=20&page=${S.discoverPage}`;
  const d = await fetchAPI(url);
  spinner.style.display = 'none';
  S.discoverLoading = false;
  if (!d?.data?.length) {
    S.hasMoreDiscover = false;
    updateLoadMoreButton();
    updateDiscoverSummary();
    return;
  }
  if (d.data.length < 20) S.hasMoreDiscover = false;
  let results = d.data;
  const pf = document.getElementById('platform-filter').value;
  if (pf) results = results.filter(a => getPlatformKeys(a).includes(pf));
  if (S.moodActive) {
    const mg = {action:'Action',romance:'Romance',dark:'Psychological',comedy:'Comedy',fantasy:'Fantasy',chill:'Slice of Life',scifi:'Sci-Fi',horror:'Horror'};
    const m = mg[S.moodActive];
    if (m) results = results.filter(a => a.genres?.some(g => g.name === m));
  }
  discoverData = [...discoverData, ...results];
  if (reset) el.innerHTML = discoverData.length
    ? discoverData.map(a => renderCard(a, false)).join('')
    : '<div class="discover-empty">No anime matched these filters. Try a different genre or reset filters.</div>';
  else el.innerHTML += results.map(a => renderCard(a, false)).join('');
  S.discoverPage++;
  updateLoadMoreButton();
  updateDiscoverSummary();
}

function updateLoadMoreButton() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;
  btn.disabled = S.discoverLoading || !S.hasMoreDiscover;
  btn.textContent = S.discoverLoading ? 'Loading...' : S.hasMoreDiscover ? 'Load More' : 'No More Anime';
  btn.style.display = discoverData.length ? 'inline-flex' : 'none';
}

function loadMoreDiscover() {
  loadDiscover(false);
}

function updateDiscoverSummary() {
  const text = document.getElementById('discover-summary-text');
  if (!text) return;
  if (S.discoverLoading) {
    text.textContent = 'Finding anime that match your filters...';
    return;
  }
  const genre = document.getElementById('genre-filter')?.selectedOptions[0]?.textContent || 'All Genres';
  const sort = document.getElementById('sort-filter')?.selectedOptions[0]?.textContent || 'Top Rated';
  const platform = document.getElementById('platform-filter')?.selectedOptions[0]?.textContent || 'All Platforms';
  const count = discoverData.length;
  text.textContent = count
    ? `Showing ${count} anime - ${genre} - ${sort} - ${platform}`
    : 'Choose filters to discover anime.';
}

function resetDiscoverFilters() {
  S.moodActive = null;
  S.discoverFilter = 'all';
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#discover-filters .filter-pill').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('genre-filter').value = '';
  document.getElementById('sort-filter').value = 'score';
  document.getElementById('platform-filter').value = '';
  loadDiscover();
}

function setDiscoverFilter(btn, filter) {
  document.querySelectorAll('#discover-filters .filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  S.discoverFilter = filter;
  loadDiscover();
}
function applyDiscoverFilters() { loadDiscover(); }

function applyMood(btn, mood) {
  if (S.moodActive === mood) {
    S.moodActive = null;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  } else {
    S.moodActive = mood;
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const gid = MOOD_GENRE_IDS[mood];
    if (gid) document.getElementById('genre-filter').value = gid;
  }
  loadDiscover();
  document.getElementById('discover').scrollIntoView({behavior: 'smooth'});
  showToast(`Mood: ${btn.querySelector('.mood-emoji').textContent} ${mood}`, 'info');
}

async function loadDailyPick() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const pageNum = (seed % 5) + 1;
  const d = await fetchAPI(`/top/anime?limit=25&page=${pageNum}`);
  if (!d?.data?.length) return;
  const idx = seed % d.data.length;
  const anime = d.data[idx];
  const card = document.getElementById('daily-card');
  const img = anime.images?.jpg?.image_url || '';
  const synopsis = anime.synopsis ? anime.synopsis.slice(0, 190) + '…' : '';
  const title = escapeHtml(anime.title || '');
  const imgSafe = escapeHtml(img);
  card.innerHTML = `
    <div class="daily-poster">${safeImage(imgSafe, title)}</div>
    <div class="daily-info">
      <span class="daily-label">⭐ Today's Pick — ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}</span>
      <div class="daily-title">${title}</div>
      <p class="daily-desc">${escapeHtml(synopsis)}</p>
      <div class="daily-actions">
        <button class="btn-sm btn-sm-primary" onclick="openAnime(${anime.mal_id})">▶ Where to Watch</button>
        <button class="btn-sm btn-sm-ghost" onclick="toggleWatchlist(${anime.mal_id},'${title.replace(/'/g,"\\'")}','${imgSafe}',${anime.score||0})">♡ Add to Watchlist</button>
      </div>
      <div class="daily-countdown">Next pick in: <span id="daily-timer"></span></div>
    </div>`;
  startDailyCountdown();
}

function startDailyCountdown() {
  if (S.intervals.daily) clearInterval(S.intervals.daily);
  function tick() {
    const el = document.getElementById('daily-timer');
    if (!el) return;
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.textContent = `${h}h ${m}m ${s}s`;
  }
  tick();
  S.intervals.daily = setInterval(tick, 1000);
}

async function loadSmartRecs() {
  if (!S.recent.length) return;
  const latest = S.recent[0];
  const section = document.getElementById('smart-recs-section');
  const el = document.getElementById('smart-recs-cards');
  document.getElementById('rec-because-label').textContent = 'BECAUSE YOU WATCHED';
  document.getElementById('rec-section-title').textContent = `More Like "${escapeHtml(latest.title?.split(':')[0] || '')}"`;
  section.style.display = 'block';
  el.innerHTML = renderSkeletons(6);
  const d = await fetchAPI(`/anime/${latest.mal_id}/recommendations`);
  if (d?.data?.length) {
    el.innerHTML = d.data.slice(0, 10).map(r => renderCard(r.entry, true)).join('');
  } else {
    section.style.display = 'none';
  }
}

function toggleQuizOption(btn, val) {
  btn.classList.toggle('selected');
  if (btn.classList.contains('selected')) S.quizSelections.add(val);
  else S.quizSelections.delete(val);
}

async function runQuiz() {
  const res = document.getElementById('quiz-result');
  res.style.display = 'block';
  res.innerHTML = '<div class="load-spinner" style="padding:16px"><div class="load-spinner-ring"></div>';
  const picks = [...S.quizSelections];
  if (!picks.length) { res.innerHTML = '<p style="color:var(--c-cyan);font-size:0.88rem">Pick at least one vibe first!</p>'; return; }
  const primary = picks[0];
  const gid = MOOD_GENRE_IDS[primary] || '1';
  const d = await fetchAPI(`/anime?genres=${gid}&order_by=score&limit=5&min_score=8`);
  if (!d?.data?.length) { res.innerHTML = '<p style="color:var(--t-dim)">No results found</p>'; return; }
  res.innerHTML = `
    <p style="font-size:0.82rem;color:var(--t-secondary);margin-bottom:14px">Perfect picks for your vibe:</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
      ${d.data.map(a => `
        <div onclick="openAnime(${a.mal_id})" style="text-align:center;width:90px" role="button" tabindex="0">
          ${safeImage(a.images?.jpg?.image_url || '', a.title || '')}
          <div style="font-size:0.65rem;color:var(--t-secondary);line-height:1.3">${escapeHtml(a.title)}</div>
        </div>`).join('')}
    </div>`;
}

function toggleSearch() {
  const ov = document.getElementById('search-overlay');
  const isActive = ov.classList.toggle('active');
  ov.setAttribute('aria-hidden', !isActive);
  if (isActive) {
    setTimeout(() => {
      const inp = document.getElementById('search-input');
      inp.focus();
      trapFocus(ov);
    }, 80);
  }
}

document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  if (q.length < 2) { hideSuggestions(); return; }
  searchTimer = setTimeout(() => fetchSuggestions(q), 350);
});
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Escape') toggleSearch();
  if (e.key === 'Enter') { const q = e.target.value.trim(); if (q) performSearch(q); }
});
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
});

async function fetchSuggestions(q) {
  const d = await fetchAPI(`/anime?q=${encodeURIComponent(q)}&limit=6`);
  if (!d?.data) return;
  showSuggestions(d.data);
}

function showSuggestions(animes) {
  const el = document.getElementById('search-suggestions');
  if (!animes.length) { el.classList.remove('visible'); return; }
  el.innerHTML = animes.map(a => {
    const pk = getPlatformKeys(a)[0];
    const badge = pk ? `<span class="suggestion-badge ptag ${PLATFORMS[pk].cls}">${escapeHtml(PLATFORMS[pk].name.split(' ')[0])}</span>` : '';
    return `<div class="suggestion-item" onclick="openAnime(${a.mal_id});toggleSearch()" role="option">
      ${safeImage(a.images?.jpg?.small_image_url || '', '')}
      <div class="suggestion-info">
        <h4>${escapeHtml(a.title)}</h4>
        <p>${a.type || ''} · ${a.year || '?'} · ⭐${a.score || 'N/A'}</p>
      </div>
      ${badge}
    </div>`;
  }).join('');
  el.classList.add('visible');
}

function hideSuggestions() { document.getElementById('search-suggestions').classList.remove('visible'); }

async function performSearch(q) {
  hideSuggestions(); toggleSearch();
  S.moodActive = null;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('discover-cards');
  el.innerHTML = renderSkeletons(12);
  document.getElementById('discover').scrollIntoView({behavior: 'smooth'});
  const d = await fetchAPI(`/anime?q=${encodeURIComponent(q)}&limit=20`);
  if (!d) return;
  el.innerHTML = d.data.map(a => renderCard(a, false)).join('');
}

async function openAnime(malId) {
  const ov = document.getElementById('modal-overlay');
  ov.classList.add('active');
  ov.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  trapFocus(ov);

  document.getElementById('modal-title').textContent = 'Loading…';
  document.getElementById('modal-banner').style.display = 'none';
  document.getElementById('modal-poster').src = '';
  document.getElementById('modal-badges').innerHTML = '';
  document.getElementById('modal-actions').innerHTML = '';
  document.getElementById('wtw-platforms').innerHTML = '<p style="color:var(--t-dim);font-size:0.82rem">Detecting platforms…</p>';
  document.getElementById('modal-synopsis').textContent = '';
  document.getElementById('modal-info-grid').innerHTML = '';
  document.getElementById('modal-genres').innerHTML = '';
  document.getElementById('modal-chars-section').style.display = 'none';
  document.getElementById('modal-recs-section').style.display = 'none';

  const d = await fetchAPI(`/anime/${malId}/full`);
  if (!d?.data) { closeModal(); return; }
  const anime = d.data;
  S.currentAnime = anime;
  addToRecent(anime);

  const imgUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
  const bannerEl = document.getElementById('modal-banner');
  bannerEl.src = imgUrl;
  bannerEl.style.display = 'block';
  document.getElementById('modal-poster').src = anime.images?.jpg?.image_url || '';
  document.getElementById('modal-title').textContent = anime.title || 'Unknown';
  document.getElementById('modal-title-jp').textContent = anime.title_japanese || '';

  const badges = [
    anime.type, anime.status, anime.rating,
    anime.score ? `⭐ ${anime.score}` : null,
    anime.year ? `${anime.year}` : null
  ].filter(Boolean).map(b => `<span class="modal-badge">${escapeHtml(String(b))}</span>`).join('');
  document.getElementById('modal-badges').innerHTML = badges;

  const inWl = S.watchlist.some(a => a.mal_id === anime.mal_id);
  const titleEsc = escapeHtml(anime.title || '').replace(/'/g, "\\'");
  const imgSafe = escapeHtml(imgUrl);

  document.getElementById('modal-actions').innerHTML = `
    <button class="modal-btn modal-btn-primary" onclick="document.getElementById('where-to-watch').scrollIntoView({behavior:'smooth'})">📺 Where to Watch</button>
    <button class="modal-btn modal-btn-secondary ${inWl ? 'watchlisted' : ''}" id="modal-wl-btn"
      onclick="toggleWatchlist(${anime.mal_id},'${titleEsc}','${imgSafe}',${anime.score || 0})">
      ${inWl ? '♥ In Watchlist' : '♡ Add to Watchlist'}
    </button>`;

  renderWhereToWatch(anime);
  document.getElementById('modal-synopsis').textContent = anime.synopsis || 'No synopsis available.';

  const info = [
    ['Episodes', anime.episodes || '—'], ['Duration', anime.duration || '—'],
    ['Status', anime.status || '—'], ['Season', anime.season ? anime.season + ' ' + anime.year : '—'],
    ['Studios', anime.studios?.map(s => s.name).join(', ') || '—'],
    ['Source', anime.source || '—'], ['Rank', anime.rank ? '#' + anime.rank : '—'],
    ['Popularity', anime.popularity ? '#' + anime.popularity : '—'],
  ];
  document.getElementById('modal-info-grid').innerHTML = info.map(([k, v]) =>
    `<div class="modal-info-item"><div class="modal-info-key">${escapeHtml(k)}</div><div class="modal-info-val">${escapeHtml(String(v))}</div></div>`
  ).join('');

  document.getElementById('modal-genres').innerHTML = (anime.genres || [])
    .map(g => `<span class="genre-tag">${escapeHtml(g.name)}</span>`).join('');

  loadModalChars(malId);
  loadModalRecs(malId);
}

async function loadModalChars(id) {
  const d = await fetchAPI(`/anime/${id}/characters`);
  if (!d?.data?.length) return;
  const main = d.data.filter(c => c.role === 'Main').slice(0, 8);
  if (!main.length) return;
  document.getElementById('modal-chars-section').style.display = 'block';
  document.getElementById('modal-chars').innerHTML = main.map(c => `
    <div class="char-card">
      ${safeImage(c.character?.images?.jpg?.image_url || '', c.character?.name || '')}
      <div class="char-name">${escapeHtml((c.character?.name || '').split(', ').reverse().join(' '))}</div>
    </div>`).join('');
}

async function loadModalRecs(id) {
  const d = await fetchAPI(`/anime/${id}/recommendations`);
  if (!d?.data?.length) return;
  document.getElementById('modal-recs-section').style.display = 'block';
  document.getElementById('modal-recs').innerHTML = d.data.slice(0, 8).map(r => `
    <div class="rec-card" onclick="openAnime(${r.entry.mal_id})" role="button" tabindex="0">
      ${safeImage(r.entry.images?.jpg?.image_url || '', r.entry.title || '')}
      <div class="rec-card-title">${escapeHtml(r.entry.title || '')}</div>
    </div>`).join('');
}

function watchOn(key, url, name, isFallback = false) {
  const ov = document.getElementById('redirect-overlay');
  document.getElementById('redirect-platform-name').textContent = name;
  ov.classList.add('active');
  setTimeout(() => { ov.classList.remove('active'); window.open(url, '_blank', 'noopener'); }, 1000);
  showToast(`${isFallback ? 'Searching on' : 'Opening'} ${name}...`, 'info');
}

function closeModal() {
  const ov = document.getElementById('modal-overlay');
  ov.classList.remove('active');
  ov.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function handleModalClick(e) { if (e.target === document.getElementById('modal-overlay')) closeModal(); }

async function loadRandomAnime() {
  showToast('Finding random anime…', 'info');
  const d = await fetchAPI('/random/anime');
  if (d?.data) openAnime(d.data.mal_id);
}

/* scroll handler */
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const nav = document.getElementById('navbar');
      const scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 40);
      document.getElementById('scroll-top').classList.toggle('visible', scrollY > 400);
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, {passive: true});

/* keyboard */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    const so = document.getElementById('search-overlay');
    if (so.classList.contains('active')) toggleSearch();
  }
});

/* ripple */
document.addEventListener('click', e => {
  const btn = e.target.closest('button,a,.anime-card,.mood-btn,.filter-pill');
  if (!btn) return;
  const r = document.createElement('span');
  r.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.appendChild(r);
  setTimeout(() => r.remove(), 500);
}, {passive: true});

/* init */
window.addEventListener('load', async () => {
  animateLoaderCounter();
  setTimeout(hideLoader, 700);

  await Promise.all([
    loadFeatured(), loadTrending(), loadTopRated(),
    loadDiscover(), loadDailyPick()
  ]);
  hideLoader();
  updateWatchlistUI();
  updateRecentUI();
  if (S.recent.length) loadSmartRecs();

  if (USE_CURSOR) document.body.classList.add('has-custom-cursor');
});
