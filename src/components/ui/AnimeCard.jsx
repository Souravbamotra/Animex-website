/* ANIMEX v5 — ANIME CARD (fixed visual hierarchy)
   Layout:
   ┌─────────────────────┐
   │ POSTER              │
   │ ┌──────┐  ┌──────┐  │  ← score BL (gold), platform dots BR
   │ │ ★9.1 │  │  CR  │  │
   │ └──────┘  └──────┘  │
   ├─────────────────────┤
   │ Title               │
   │ [Action] [Fantasy]  │  ← genre pills always visible
   │ TV · 24eps · 2024   │  ← episode count in meta
   └─────────────────────┘
*/
import { useCallback } from 'react';
import styles from './AnimeCard.module.css';
import PlatformBadge from './PlatformBadge.jsx';
import { useAppStore } from '../../store/useAppStore.js';
import { detectPlatforms } from '../../lib/config.js';
import { fetchAPI } from '../../lib/api.js';

export default function AnimeCard({ anime, inRow = true }) {
  const { watchlist, toggleWatchlist, openModal, addToRecent } = useAppStore();
  const inWl = watchlist.some(a => a.mal_id === anime.mal_id);
  const platforms = detectPlatforms(anime);
  const img = anime.images?.jpg?.image_url || '';
  const title = anime.title || 'Unknown';
  const genres = (anime.genres || []).slice(0, 2);

  const handleOpen = useCallback(async () => {
    // Open with basic data immediately, then load full data
    const basicAnime = { ...anime, _loading: true };
    openModal(basicAnime);
    addToRecent(anime);
    const d = await fetchAPI(`/anime/${anime.mal_id}/full`);
    if (d?.data) openModal(d.data);
  }, [anime, openModal, addToRecent]);

  const handleWatchlist = useCallback(e => {
    e.stopPropagation();
    toggleWatchlist(anime.mal_id, title, img, anime.score || 0, anime.episodes || null);
  }, [anime, title, img, toggleWatchlist]);

  const handleTrailer = useCallback(async e => {
    e.stopPropagation();
    const d = await fetchAPI(`/anime/${anime.mal_id}/full`);
    if (d?.data) {
      openModal(d.data);
      addToRecent(d.data);
      setTimeout(() => {
        document.getElementById('modal-trailer-anchor')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [anime.mal_id, openModal, addToRecent]);

  return (
    <div
      className={`${styles.card} ${inRow ? styles.inRow : ''}`}
      onClick={handleOpen}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
      role="button"
      tabIndex={0}
      aria-label={title}
    >
      <div className={styles.poster}>
        {img ? (
          <img src={img} alt={title} loading="lazy" className={styles.img} />
        ) : (
          <div className={styles.imgPlaceholder}>
            <span>ANIMEX</span>
          </div>
        )}

        {/* Score badge — bottom-left, gold */}
        {anime.score && (
          <div className={styles.scoreBadge}>
            <span className={styles.scoreStar}>★</span>
            <span className={styles.scoreVal}>{anime.score}</span>
          </div>
        )}

        {/* Platform badges — bottom-right, CSS text */}
        <div className={styles.platformBadges}>
          {platforms.slice(0, 2).map(p => (
            <PlatformBadge key={p.key} platformKey={p.key} fallback={p.fallback} />
          ))}
        </div>

        {/* Heart button */}
        <button
          className={`${styles.heartBtn} ${inWl ? styles.heartActive : ''}`}
          onClick={handleWatchlist}
          aria-label={inWl ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWl ? '♥' : '♡'}
        </button>

        {/* Hover overlay */}
        <div className={styles.overlay}>
          <button className={styles.overlayBtn} onClick={handleTrailer}>
            ▶ Trailer
          </button>
          <button className={styles.overlayBtnGhost} onClick={handleOpen}>
            Info
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.title}>{title}</div>

        {/* Genre pills — always visible */}
        {genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map(g => (
              <span key={g.mal_id} className={styles.genrePill}>{g.name}</span>
            ))}
          </div>
        )}

        {/* Meta row with episode count */}
        <div className={styles.meta}>
          {[
            anime.type,
            anime.episodes ? `${anime.episodes} eps` : (anime.status === 'Currently Airing' ? 'Airing' : null),
            anime.year,
          ].filter(Boolean).join(' · ')}
        </div>
      </div>
    </div>
  );
}
