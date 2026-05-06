/* ANIMEX v5 — ANIME MODAL (improved: taller banner, better brightness) */
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import { fetchAPI } from '../../lib/api.js';
import { detectPlatforms, PLATFORMS } from '../../lib/config.js';
import styles from './AnimeModal.module.css';

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export default function AnimeModal() {
  const { modalOpen, currentAnime, closeModal, watchlist, toggleWatchlist, preferredPlatform, setPreferredPlatform, clearPreferredPlatform, addToast, openModal, addToRecent } = useAppStore();
  const [chars, setChars]         = useState([]);
  const [recs, setRecs]           = useState([]);
  const [trailerSrc, setTrailer]  = useState('');
  const overlayRef                = useRef(null);

  const anime = currentAnime;
  const inWl  = anime ? watchlist.some(a => a.mal_id === anime.mal_id) : false;

  useEffect(() => {
    if (!modalOpen) { setChars([]); setRecs([]); setTrailer(''); return; }
    if (!anime?.mal_id || anime._loading) return;
    document.body.style.overflow = 'hidden';

    if (anime.trailer?.embed_url) {
      let url = anime.trailer.embed_url;
      if (!url.includes('autoplay=')) url += (url.includes('?') ? '&' : '?') + 'autoplay=0';
      setTrailer(url);
    } else setTrailer('');

    // Load chars & recs
    fetchAPI(`/anime/${anime.mal_id}/characters`).then(d => {
      const main = (d?.data || []).filter(c => c.role === 'Main').slice(0, 8);
      setChars(main);
    });
    fetchAPI(`/anime/${anime.mal_id}/recommendations`).then(d => {
      setRecs((d?.data || []).slice(0, 8));
    });

    return () => { document.body.style.overflow = ''; };
  }, [modalOpen, anime?.mal_id]);

  const handleClose = () => { closeModal(); setTrailer(''); document.body.style.overflow = ''; };

  const handleOverlayClick = e => { if (e.target === overlayRef.current) handleClose(); };

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!modalOpen) return null;

  const img    = anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url || '';
  const poster = anime?.images?.jpg?.image_url || '';
  const platforms = anime ? detectPlatforms(anime) : [];
  const sorted = preferredPlatform
    ? [...platforms].sort((a, b) => a.key === preferredPlatform ? -1 : b.key === preferredPlatform ? 1 : 0)
    : platforms;

  const watchOn = (key, url, name, isFallback) => {
    const el = document.getElementById('redirect-overlay-el');
    if (el) {
      el.querySelector('.redirect-platform-name').textContent = name;
      el.classList.add('active');
      setTimeout(() => { el.classList.remove('active'); window.open(url, '_blank', 'noopener'); }, 1000);
    } else window.open(url, '_blank', 'noopener');
    addToast(`${isFallback ? 'Searching on' : 'Opening'} ${name}...`, 'info');
  };

  const info = [
    ['Episodes', anime?.episodes || '—'],
    ['Duration', anime?.duration || '—'],
    ['Status',   anime?.status || '—'],
    ['Season',   anime?.season ? `${anime.season} ${anime.year}` : '—'],
    ['Studios',  anime?.studios?.map(s => s.name).join(', ') || '—'],
    ['Source',   anime?.source || '—'],
    ['Rank',     anime?.rank ? `#${anime.rank}` : '—'],
    ['Popularity', anime?.popularity ? `#${anime.popularity}` : '—'],
  ];

  const openRec = async mal_id => {
    const d = await fetchAPI(`/anime/${mal_id}/full`);
    if (d?.data) { openModal(d.data); addToRecent(d.data); }
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog" aria-modal="true" aria-label="Anime details"
    >
      <div className={styles.modal}>
        {/* ─── HERO BANNER (taller: 280px, brightness 0.7) ─── */}
        <div className={styles.bannerWrap}>
          {img && <img src={img} alt="" className={styles.banner} />}
          <div className={styles.bannerFade} />
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>

          <div className={styles.bannerBottom}>
            {poster && <img src={poster} alt={anime?.title} className={styles.poster} />}
            <div className={styles.bannerInfo}>
              {anime?._loading ? (
                <div className="skel-line w80" style={{ height: '28px' }} />
              ) : (
                <>
                  <h2 className={styles.title}>{anime?.title || 'Loading…'}</h2>
                  {anime?.title_japanese && <div className={styles.titleJp}>{anime.title_japanese}</div>}
                  <div className={styles.badges}>
                    {anime?.score && (
                      <span className={styles.scoreBadge}>
                        <span style={{ color: 'var(--c-gold)' }}>★</span> {anime.score}
                      </span>
                    )}
                    {[anime?.type, anime?.status, anime?.rating].filter(Boolean).map(b => (
                      <span key={b} className={styles.badge}>{b}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ─── BODY ─── */}
        <div className={styles.body}>
          {/* Actions */}
          <div className={styles.actions}>
            {trailerSrc && (
              <button className="btn-primary" onClick={() => document.getElementById('modal-trailer-anchor')?.scrollIntoView({ behavior: 'smooth' })}>
                ▶ Watch Trailer
              </button>
            )}
            <button className="btn-secondary" onClick={() => document.getElementById('modal-wtw')?.scrollIntoView({ behavior: 'smooth' })}>
              📺 Where to Watch
            </button>
            <button
              className={`btn-secondary ${inWl ? styles.watchlisted : ''}`}
              onClick={() => toggleWatchlist(anime.mal_id, anime.title, poster, anime.score || 0, anime.episodes || null)}
            >
              {inWl ? '♥ In Watchlist' : '♡ Add to Watchlist'}
            </button>
          </div>

          {/* Where to Watch */}
          <div id="modal-wtw" className={styles.section}>
            <div className={styles.sectionLabelWrap}>
              <div className={styles.sectionLabel}>
                <span style={{ color: 'var(--c-green)' }}>✓</span> Where to Watch
              </div>
              <div className={styles.legalNote}>Official &amp; legal only</div>
            </div>
            <div className={styles.platforms}>
              {sorted.map(p => {
                const info = PLATFORMS[p.key];
                return (
                  <button
                    key={p.key}
                    className={`${styles.platformCard} ${p.fallback ? styles.pfFallback : styles.pfConfirmed}`}
                    style={{ '--brand': info.color }}
                    onClick={() => watchOn(p.key, p.url, info.name, p.fallback)}
                    aria-label={`${p.fallback ? 'Search' : 'Watch'} on ${info.name}`}
                  >
                    {p.key === preferredPlatform && <span className={styles.pfDefault}>Default</span>}
                    <div className={styles.pfName}>{info.name}</div>
                    <div className={styles.pfAction}>{p.fallback ? 'Search' : 'Watch'} →</div>
                  </button>
                );
              })}
            </div>
            <div className={styles.preferRow}>
              <span className={styles.preferLabel}>Set default:</span>
              <div className={styles.preferBtns}>
                {Object.entries(PLATFORMS).map(([k, v]) => (
                  <button
                    key={k}
                    className={`${styles.preferBtn} ${preferredPlatform === k ? styles.preferActive : ''}`}
                    onClick={() => setPreferredPlatform(k)}
                  >
                    {v.name.split(' ')[0]}
                  </button>
                ))}
                {preferredPlatform && (
                  <button className={styles.preferBtn} style={{ borderColor: 'var(--c-pink)', color: 'var(--c-pink)' }} onClick={clearPreferredPlatform}>Clear</button>
                )}
              </div>
            </div>
            <div className={styles.regionNote}>🌍 Availability varies by region.</div>
          </div>

          {/* Trailer */}
          {trailerSrc && (
            <div id="modal-trailer-anchor" className={styles.section}>
              <div className={styles.sectionLabel}>Trailer</div>
              <div className={styles.trailerFrame}>
                <iframe
                  src={trailerSrc}
                  title="Anime trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className={styles.iframe}
                />
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Synopsis</div>
            <p className={styles.synopsis}>{anime?.synopsis || 'No synopsis available.'}</p>
          </div>

          {/* Details grid */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Details</div>
            <div className={styles.infoGrid}>
              {info.map(([k, v]) => (
                <div key={k} className={styles.infoItem}>
                  <div className={styles.infoKey}>{k}</div>
                  <div className={styles.infoVal}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Genres */}
          {anime?.genres?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Genres</div>
              <div className={styles.genreTags}>
                {anime.genres.map(g => (
                  <span key={g.mal_id} className="genre-tag">{g.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Characters */}
          {chars.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Characters</div>
              <div className={styles.charsRow}>
                {chars.map(c => (
                  <div key={c.character?.mal_id} className={styles.charCard}>
                    <img
                      src={c.character?.images?.jpg?.image_url || ''}
                      alt={c.character?.name || ''}
                      className={styles.charImg}
                      loading="lazy"
                    />
                    <div className={styles.charName}>
                      {(c.character?.name || '').split(', ').reverse().join(' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recs.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>More Like This</div>
              <div className={styles.recsRow}>
                {recs.map(r => (
                  <div
                    key={r.entry.mal_id}
                    className={styles.recCard}
                    onClick={() => openRec(r.entry.mal_id)}
                    role="button" tabIndex={0}
                  >
                    <img
                      src={r.entry.images?.jpg?.image_url || ''}
                      alt={r.entry.title}
                      className={styles.recImg}
                      loading="lazy"
                    />
                    <div className={styles.recTitle}>{r.entry.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
