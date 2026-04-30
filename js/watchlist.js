/*═══════════════════════════════════════════
   ANIMEX v4 — WATCHLIST & RECENT
   Safe localStorage, achievements, cleanup
══════════════════════════════════════════*/

function toggleWatchlist(id, title, img, score) {
  const idx = S.watchlist.findIndex(a => a.mal_id === id);
  if (idx > -1) {
    S.watchlist.splice(idx, 1);
    showToast('Removed from watchlist', 'warning');
  } else {
    S.watchlist.push({mal_id: id, title, images: {jpg: {image_url: img}}, score});
    showToast('♥ Added to watchlist', 'success');
    checkAchievements();
  }
  safeStorageSet('animex_watchlist', S.watchlist);
  updateWatchlistUI();

  const inWl = S.watchlist.some(a => a.mal_id === id);
  document.querySelectorAll(`[data-id="${id}"] .card-heart-btn`).forEach(b => {
    b.classList.toggle('active', inWl);
    b.textContent = inWl ? '♥' : '♡';
  });
  const mb = document.getElementById('modal-wl-btn');
  if (mb) {
    mb.className = `modal-btn modal-btn-secondary ${inWl ? 'watchlisted' : ''}`;
    mb.textContent = inWl ? '♥ In Watchlist' : '♡ Add to Watchlist';
  }
  document.getElementById('watchlist-count-nav').textContent = S.watchlist.length;
}

function checkAchievements() {
  const ach = ACHIEVEMENTS.find(a => a.count === S.watchlist.length);
  if (!ach) return;
  const pop = document.getElementById('achievement-pop');
  document.getElementById('ach-icon').textContent = ach.icon;
  document.getElementById('ach-label').textContent = ach.label;
  document.getElementById('ach-desc').textContent = ach.desc;
  pop.classList.add('show');
  setTimeout(() => pop.classList.remove('show'), 3500);
}

function updateWatchlistUI() {
  const sec = document.getElementById('watchlist-section');
  const el = document.getElementById('watchlist-cards');
  document.getElementById('watchlist-count-nav').textContent = S.watchlist.length;
  if (!S.watchlist.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  el.innerHTML = S.watchlist.map(a => renderCard(a, true)).join('');
}

function clearWatchlist() {
  S.watchlist = [];
  safeStorageRemove('animex_watchlist');
  updateWatchlistUI();
  showToast('Watchlist cleared', 'warning');
}

function addToRecent(anime) {
  const idx = S.recent.findIndex(a => a.mal_id === anime.mal_id);
  if (idx > -1) S.recent.splice(idx, 1);
  S.recent.unshift({
    mal_id: anime.mal_id,
    title: anime.title,
    images: anime.images,
    score: anime.score,
    type: anime.type
  });
  if (S.recent.length > 12) S.recent.pop();
  safeStorageSet('animex_recent', S.recent);
  updateRecentUI();
  loadSmartRecs();
}

function updateRecentUI() {
  const sec = document.getElementById('recently-section');
  const el = document.getElementById('recently-cards');
  if (!S.recent.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';
  el.innerHTML = S.recent.map(a => renderCard(a, true)).join('');
}

function clearRecent() {
  S.recent = [];
  safeStorageRemove('animex_recent');
  updateRecentUI();
  document.getElementById('smart-recs-section').style.display = 'none';
}

function setPreferredPlatform(key) {
  S.preferredPlatform = key;
  safeStorageSet('animex_pref', key);
  renderWhereToWatch(S.currentAnime);
  showToast(`${PLATFORMS[key].name} set as default ★`, 'success');
}

function clearPref() {
  S.preferredPlatform = null;
  safeStorageRemove('animex_pref');
  if (S.currentAnime) renderWhereToWatch(S.currentAnime);
}
