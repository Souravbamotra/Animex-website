/*
   ANIMEX v4 - UI RENDERING
   Cards, skeletons, toasts, modal content
*/

function getPlatformKeys(anime) {
  return detectPlatforms(anime).map(p => p.key);
}

function handleCardKey(event, malId) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  if (event.target.closest('button, a, input, select, textarea')) return;
  event.preventDefault();
  openAnime(malId);
}

function renderCard(anime, inRow = true) {
  const inWl = S.watchlist.some(a => a.mal_id === anime.mal_id);
  const platforms = detectPlatforms(anime);
  const badgesHTML = platforms.slice(0, 2).map(p => {
    const info = PLATFORMS[p.key];
    const label = p.fallback ? 'Search' : info.name.split(' ')[0];
    return `<span class="ptag ${info.cls} ${p.fallback ? 'fallback' : ''}">${escapeHtml(label)}</span>`;
  }).join('');
  const scoreHTML = anime.score ? `<div class="card-score-badge">&#9733; ${anime.score}</div>` : '';
  const title = escapeHtml(anime.title || 'Unknown');
  const imgUrl = escapeHtml(anime.images?.jpg?.image_url || '');

  return `<div class="anime-card" data-id="${anime.mal_id}" onclick="openAnime(${anime.mal_id})" onkeydown="handleCardKey(event, ${anime.mal_id})" role="button" tabindex="0" aria-label="${title}">
    <div class="card-poster">
      ${safeImage(imgUrl, title)}
      <div class="card-platform-tags">${badgesHTML}</div>
      ${scoreHTML}
      <button class="card-heart-btn ${inWl ? 'active' : ''}"
        onclick="event.stopPropagation();toggleWatchlist(${anime.mal_id},'${title.replace(/'/g, "\\'")}','${imgUrl}',${anime.score || 0})"
        aria-label="${inWl ? 'Remove from watchlist' : 'Add to watchlist'}">
        ${inWl ? '&hearts;' : '&#9825;'}
      </button>
      <div class="card-overlay">
        <div class="card-overlay-btns">
          <button class="card-btn card-btn-watch" onclick="event.stopPropagation();openAnime(${anime.mal_id})">Where</button>
          <button class="card-btn card-btn-info" onclick="event.stopPropagation();openAnime(${anime.mal_id})">Info</button>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-score-row">${anime.score ? '&#9733; ' + anime.score : ''}</div>
      <div class="card-title">${title}</div>
      <div class="card-meta">${anime.type || '?'}${anime.episodes ? ' - ' + anime.episodes + ' eps' : ''}${anime.year ? ' - ' + anime.year : ''}</div>
    </div>
  </div>`;
}

function renderSkeletons(n = 6) {
  return Array(n).fill(0).map(() =>
    `<div class="skeleton-card"><div class="skel-poster"></div><div class="skel-line w80"></div><div class="skel-line w60"></div></div>`
  ).join('');
}

function showToast(msg, type = 'info') {
  const icons = {success: 'OK', info: 'i', warning: '!'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${escapeHtml(msg)}</span>`;
  document.getElementById('toast-container').appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 2800);
}

function renderWhereToWatch(anime) {
  const platforms = detectPlatforms(anime);
  const pref = S.preferredPlatform;
  const sorted = pref ? [...platforms].sort((a, b) => a.key === pref ? -1 : b.key === pref ? 1 : 0) : platforms;

  document.getElementById('wtw-platforms').innerHTML = sorted.map(p => {
    const info = PLATFORMS[p.key];
    const isPref = p.key === pref;
    const action = p.fallback ? 'Search' : 'Watch';
    const title = anime.title || 'this anime';
    const aria = p.fallback ? `Search for ${title} on ${info.name}` : `Watch ${title} on ${info.name}`;
    return `<a class="platform-card ${info.cls} ${p.fallback ? 'fallback' : 'confirmed'}" href="#" aria-label="${escapeHtml(aria)}" onclick="event.preventDefault();watchOn('${p.key}','${escapeHtml(p.url)}','${escapeHtml(info.name)}',${p.fallback ? 'true' : 'false'})">
      ${isPref ? `<span style="position:absolute;top:6px;left:6px;font-size:0.6rem;color:var(--c-gold)">Default</span>` : ''}
      <div class="platform-icon">${info.icon}</div>
      <div class="platform-name">${escapeHtml(info.name)}</div>
      <div class="platform-watch-cta">${action}</div>
    </a>`;
  }).join('');

  const hasOnlyFallbacks = platforms.every(p => p.fallback);
  const prefEl = document.getElementById('wtw-prefer');
  prefEl.style.display = 'flex';
  prefEl.innerHTML = `<span class="wtw-prefer-label">${hasOnlyFallbacks ? 'No confirmed stream found. Showing platform searches.' : 'Default platform:'}</span>
    <div class="wtw-prefer-btns">
      ${Object.entries(PLATFORMS).map(([k, v]) =>
        `<button class="prefer-btn ${pref === k ? 'active' : ''}" onclick="setPreferredPlatform('${k}')">${escapeHtml(v.name.split(' ')[0])}</button>`
      ).join('')}
      ${pref ? `<button class="prefer-btn" onclick="clearPref()" style="border-color:var(--c-pink);color:var(--c-pink)">Clear</button>` : ''}
    </div>`;
}
