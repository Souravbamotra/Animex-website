/* ANIMEX v5 — DAILY PICK */
import { useEffect, useState } from 'react';
import { fetchAPI } from '../../lib/api.js';
import { useAppStore } from '../../store/useAppStore.js';
import SectionLabel from '../ui/SectionLabel.jsx';
import styles from './DailyPick.module.css';

export default function DailyPick() {
  const { openModal, addToRecent, toggleWatchlist, watchlist } = useAppStore();
  const [anime, setAnime]         = useState(null);
  const [countdown, setCountdown] = useState('');
  const [error, setError]         = useState(false);

  useEffect(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    fetchAPI(`/top/anime?limit=25&page=${(seed % 5) + 1}`).then(d => {
      if (!d?.data?.length) { setError(true); return; }
      setAnime(d.data[seed % d.data.length]);
    });

    const tick = () => {
      const now = new Date();
      const midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Don't render if no data and no error (loading) — avoids flash of empty
  if (!anime && !error) return null;

  if (error) return null; // Silently skip on error rather than showing broken UI

  const inWl  = watchlist.some(a => a.mal_id === anime.mal_id);
  const img   = anime.images?.jpg?.image_url || '';
  const date  = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const handleOpen = async () => {
    const d = await fetchAPI(`/anime/${anime.mal_id}/full`);
    const data = d?.data || anime;
    openModal(data); addToRecent(data);
  };

  return (
    <div className={styles.section} id="daily-section">
      <div className="section-header" style={{ marginBottom: '18px' }}>
        <div>
          <SectionLabel icon="📅" label="Every Day New Pick" color="var(--c-violet)" />
          <h2 className="section-title">Daily Recommendation</h2>
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.posterWrap}>
          {img && <img src={img} alt={anime.title} className={styles.poster} />}
        </div>
        <div className={styles.info}>
          <span className={styles.label}>⭐ Today's Pick — {date}</span>
          <div className={styles.title}>{anime.title}</div>
          {anime.score && (
            <div className={styles.score}>
              <span style={{ color: 'var(--c-gold)' }}>★</span> {anime.score}/10
            </div>
          )}
          <p className={styles.desc}>{anime.synopsis?.slice(0, 200)}…</p>
          <div className={styles.actions}>
            <button className="btn-primary" onClick={handleOpen}>▶ Where to Watch</button>
            <button
              className={`btn-secondary ${inWl ? styles.watchlisted : ''}`}
              onClick={() => toggleWatchlist(anime.mal_id, anime.title, img, anime.score || 0, anime.episodes || null)}
            >
              {inWl ? '♥' : '♡'} Watchlist
            </button>
          </div>
          <div className={styles.countdown}>Next pick in: <span style={{ color: 'var(--c-cyan)', fontVariantNumeric: 'tabular-nums' }}>{countdown}</span></div>
        </div>
      </div>
    </div>
  );
}
