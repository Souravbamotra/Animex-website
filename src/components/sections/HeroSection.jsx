/* ANIMEX v5 — HERO SECTION */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAPI } from '../../lib/api.js';
import { useAppStore } from '../../store/useAppStore.js';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  const { openModal, addToRecent } = useAppStore();
  const [featured, setFeatured]   = useState([]);
  const [idx, setIdx]             = useState(0);
  const [transitioning, setTrans] = useState(false);
  const [error, setError]         = useState(false);
  const intervalRef               = useRef(null);

  useEffect(() => {
    fetchAPI('/top/anime?filter=airing&limit=10').then(d => {
      const list = (d?.data || []).filter(a => a.images?.jpg?.large_image_url);
      if (!list.length) { setError(true); return; }
      setFeatured(list);
    });
  }, []);

  const goTo = useCallback(i => {
    setTrans(true);
    setTimeout(() => { setIdx(i); setTrans(false); }, 300);
  }, []);

  // FIX: use functional state updater — no more IIFE/stale idx closure
  // FIX: remove idx from deps so interval doesn't reset every slide change
  useEffect(() => {
    if (!featured.length) return;
    intervalRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % featured.length);
    }, 7000);
    return () => clearInterval(intervalRef.current);
  }, [featured.length]);

  const anime = featured[idx];

  // FIX: merged handleWatch & handleTrailer into one function with a param
  const handleOpen = useCallback(async (scrollToTrailer = false) => {
    if (!anime) return;
    const d = await fetchAPI(`/anime/${anime.mal_id}/full`);
    const data = d?.data || anime;
    openModal(data);
    addToRecent(data);
    if (scrollToTrailer) {
      setTimeout(() => document.getElementById('modal-trailer-anchor')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [anime, openModal, addToRecent]);

  const bg = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || '';

  if (error) {
    return (
      <section id="hero" className={styles.hero} aria-label="Featured anime">
        <div className={styles.gradient} />
        <div className={styles.content}>
          <div className={styles.left}>
            {/* FIX: stable h1 for SEO — anime title moves to h2/div */}
            <h1 className={styles.titleMain} style={{ marginBottom: '12px' }}>
              Discover Your Next Anime Obsession
            </h1>
            <p className={styles.desc}>Find what to watch across all major legal streaming platforms.</p>
            <div className={styles.actions}>
              <button
                className={`btn-primary ${styles.primaryBtn}`}
                onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="btn-icon">✦</span> Explore Anime
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className={styles.hero} aria-label="Featured anime">
      {/* Background */}
      <div
        className={`${styles.bg} ${transitioning ? styles.bgTransition : ''}`}
        style={bg ? { backgroundImage: `url('${bg}')` } : {}}
      />
      <div className={styles.gradient} />
      <div className={styles.noise} />

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.featuredLabel}>
            <span className={styles.dot} />
            <span>Featured Anime · Now Airing</span>
          </div>

          {/* FIX: stable h1 for SEO — always describes the page purpose */}
          <h1 className={`${styles.title} ${transitioning ? styles.titleOut : styles.titleIn}`}>
            <span className={styles.titleMain}>Discover Your Next Anime</span>
            <span className={styles.titleAccent}>
              {anime?.title || 'Loading…'}
            </span>
            {anime?.title_japanese && (
              <span className={styles.titleJp}>{anime.title_japanese}</span>
            )}
          </h1>

          <p className={styles.desc}>
            {anime?.synopsis
              ? anime.synopsis.slice(0, 155) + '…'
              : 'Explore thousands of anime across every genre and instantly find which platform streams them.'}
          </p>

          <div className={styles.meta}>
            {anime?.score && (
              <div className={styles.score}>
                <span className={styles.scoreStar}>★</span>
                <span className={styles.scoreVal}>{anime.score}</span>
                <span className={styles.scoreSub}>/10</span>
              </div>
            )}
            {[anime?.type, anime?.year, anime?.episodes ? `${anime.episodes} eps` : (anime?.status === 'Currently Airing' ? 'Ongoing' : null)]
              .filter(Boolean)
              .map(b => <span key={b} className={styles.badge}>{b}</span>)}
          </div>

          <div className={styles.actions}>
            <button className={`btn-primary ${styles.primaryBtn}`} onClick={() => handleOpen(false)}>
              <span className="btn-icon">▶</span> Where to Watch
            </button>
            {anime?.trailer?.embed_url && (
              <button className={`btn-secondary ${styles.secondaryBtn}`} onClick={() => handleOpen(true)}>
                <span className="btn-icon">📺</span> Trailer
              </button>
            )}
            <button
              className={`btn-secondary ${styles.secondaryBtn}`}
              onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore All
            </button>
          </div>

          {/* Dots */}
          <div className={styles.dots}>
            {featured.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot2} ${i === idx ? styles.dotActive : ''}`}
                onClick={() => { clearInterval(intervalRef.current); goTo(i); }}
                aria-label={`Show featured anime ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stack cards — hidden below 900px via CSS */}
        <div className={styles.right} aria-hidden="true">
          {featured.slice(1, 4).map((a, i) => {
            const configs = [
              { style: { width: '150px', height: '210px', right: '160px', top: '50px', '--rot': '-8deg' } },
              { style: { width: '160px', height: '226px', right: '60px',  top: '20px', '--rot': '4deg' } },
              { style: { width: '140px', height: '196px', right: '10px',  top: '100px','--rot': '10deg' } },
            ];
            return (
              <div key={i} className={styles.stackCard} style={configs[i]?.style}>
                {a.images?.jpg?.image_url && (
                  <img src={a.images.jpg.image_url} alt={a.title} loading="lazy" className={styles.stackImg} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className={styles.stats}>
        {[['10K+','Anime Titles'],['6','Platforms'],['100%','Legal'],['Free','No Account']].map(([n, l]) => (
          <div key={l} className={styles.stat}>
            <div className={styles.statNum}>{n}</div>
            <div className={styles.statLabel}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
