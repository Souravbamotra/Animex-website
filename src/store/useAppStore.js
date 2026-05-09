/* ANIMEX v5 — ZUSTAND STORE */
import { create } from 'zustand';
import { safeGet, safeSet, safeRemove } from '../lib/storage.js';
import { ACHIEVEMENTS, PLATFORMS } from '../lib/config.js';

export const useAppStore = create((set, get) => ({
  /* ─── Persistent state ─── */
  watchlist: safeGet('animex_watchlist', '[]'),
  recent: safeGet('animex_recent', '[]'),
  preferredPlatform: safeGet('animex_pref', 'null'),

  /* ─── Transient state ─── */
  discoverFilter: 'all',
  discoverPage: 1,
  discoverLoading: false,
  hasMoreDiscover: true,
  moodActive: null,
  currentAnime: null,
  modalOpen: false,
  searchOpen: false,
  toasts: [],
  redirectingTo: null, // FIX: replaces direct DOM manipulation on redirect overlay

  /* ─── Achievement popup ─── */
  achievement: null,

  /* ─── Watchlist actions ─── */
  toggleWatchlist(id, title, img, score, episodes = null) {
    const wl = [...get().watchlist];
    const idx = wl.findIndex(a => a.mal_id === id);
    let added = false;
    if (idx > -1) {
      wl.splice(idx, 1);
      get().addToast('Removed from watchlist', 'warning');
    } else {
      wl.push({ mal_id: id, title, images: { jpg: { image_url: img } }, score, episodes, episodes_watched: 0 });
      added = true;
      get().addToast('♥ Added to watchlist', 'success');
    }
    safeSet('animex_watchlist', wl);
    set({ watchlist: wl });
    if (added) {
      const ach = ACHIEVEMENTS.find(a => a.count === wl.length);
      if (ach) {
        set({ achievement: ach });
        setTimeout(() => set({ achievement: null }), 3500);
      }
    }
  },

  clearWatchlist() {
    safeRemove('animex_watchlist');
    set({ watchlist: [] });
    get().addToast('Watchlist cleared', 'warning');
  },

  updateEpisode(id, diff) {
    const wl = get().watchlist.map(item => {
      if (item.mal_id !== id) return item;
      const watched = Math.max(0, (item.episodes_watched || 0) + diff);
      return { ...item, episodes_watched: item.episodes ? Math.min(watched, item.episodes) : watched };
    });
    safeSet('animex_watchlist', wl);
    set({ watchlist: wl });
  },

  exportWatchlist() {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(get().watchlist));
    const a = document.createElement('a');
    a.href = data; a.download = 'animex_watchlist.json';
    document.body.appendChild(a); a.click(); a.remove();
  },

  importWatchlist(parsed) {
    if (!Array.isArray(parsed)) return;
    safeSet('animex_watchlist', parsed);
    set({ watchlist: parsed });
    get().addToast('Watchlist imported!', 'success');
  },

  /* ─── Recent ─── */
  addToRecent(anime) {
    const recent = [...get().recent].filter(a => a.mal_id !== anime.mal_id);
    recent.unshift({ mal_id: anime.mal_id, title: anime.title, images: anime.images, score: anime.score, type: anime.type });
    if (recent.length > 12) recent.pop();
    safeSet('animex_recent', recent);
    set({ recent });
  },

  clearRecent() {
    safeRemove('animex_recent');
    set({ recent: [] });
  },

  /* ─── Platform preference ─── */
  setPreferredPlatform(key) {
    safeSet('animex_pref', key);
    set({ preferredPlatform: key });
    get().addToast(`${PLATFORMS[key].name} set as default ★`, 'success');
  },

  clearPreferredPlatform() {
    safeRemove('animex_pref');
    set({ preferredPlatform: null });
  },

  /* ─── Redirect overlay (replaces DOM manipulation) ─── */
  setRedirecting(platformName) { set({ redirectingTo: platformName }); },

  /* ─── Discover ─── */
  setDiscoverFilter(f)    { set({ discoverFilter: f, discoverPage: 1 }); },
  setMoodActive(m)        { set({ moodActive: m }); },
  setDiscoverLoading(v)   { set({ discoverLoading: v }); },
  setDiscoverPage(p)      { set({ discoverPage: p }); },
  setHasMoreDiscover(v)   { set({ hasMoreDiscover: v }); },

  /* ─── Modal ─── */
  openModal(anime) { set({ currentAnime: anime, modalOpen: true }); },
  closeModal()     { set({ modalOpen: false, currentAnime: null }); },

  /* ─── Search ─── */
  toggleSearch()  { set(s => ({ searchOpen: !s.searchOpen })); },
  closeSearch()   { set({ searchOpen: false }); },

  /* ─── Toasts ─── */
  addToast(msg, type = 'info') {
    const id = Date.now() + Math.random();
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3000);
  },
}));
