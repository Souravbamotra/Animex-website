/* ANIMEX v5 — SEARCH OVERLAY */
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import { fetchAPI } from '../../lib/api.js';
import { detectPlatforms, PLATFORMS } from '../../lib/config.js';
import styles from './SearchOverlay.module.css';

export default function SearchOverlay({ onOpenAnime }) {
  const { searchOpen, closeSearch, openModal, addToRecent } = useAppStore();
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggs]     = useState([]);
  const inputRef                    = useRef(null);
  const timerRef                    = useRef(null);

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); closeSearch(); }
      if (e.key === 'Escape' && searchOpen) closeSearch();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
    else { setQuery(''); setSuggs([]); }
  }, [searchOpen]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.length < 2) { setSuggs([]); return; }
    timerRef.current = setTimeout(async () => {
      const d = await fetchAPI(`/anime?q=${encodeURIComponent(query)}&limit=6`);
      setSuggs(d?.data || []);
    }, 350);
  }, [query]);

  const handleSelect = async anime => {
    closeSearch(); setQuery(''); setSuggs([]);
    const d = await fetchAPI(`/anime/${anime.mal_id}/full`);
    const data = d?.data || anime;
    openModal(data); addToRecent(data);
  };

  const handleSearch = async e => {
    if (e.key !== 'Enter' || !query.trim()) return;
    const d = await fetchAPI(`/anime?q=${encodeURIComponent(query.trim())}&limit=20`);
    closeSearch(); setQuery(''); setSuggs([]);
    document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
    if (onOpenAnime) onOpenAnime(d?.data || []);
  };

  if (!searchOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog" aria-label="Search" aria-modal="true"
      onClick={e => e.target === e.currentTarget && closeSearch()}
    >
      <div className={styles.wrap}>
        <div className={styles.field}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search anime…"
            className={styles.input}
            autoComplete="off"
            aria-label="Search anime"
          />
          <button className={styles.close} onClick={closeSearch} aria-label="Close search">✕</button>
        </div>
        <div className={styles.hint}>
          Press <kbd className={styles.kbd}>Enter</kbd> to search · <kbd className={styles.kbd}>Esc</kbd> to close
        </div>
        {suggestions.length > 0 && (
          <div className={styles.suggestions} role="listbox">
            {suggestions.map(a => {
              const pk = detectPlatforms(a)[0]?.key;
              return (
                <div
                  key={a.mal_id}
                  className={styles.suggestion}
                  onClick={() => handleSelect(a)}
                  role="option"
                >
                  <img
                    src={a.images?.jpg?.small_image_url || ''}
                    alt={a.title}
                    className={styles.sugImg}
                    loading="lazy"
                  />
                  <div className={styles.sugInfo}>
                    <div className={styles.sugTitle}>{a.title}</div>
                    <div className={styles.sugMeta}>
                      {[a.type, a.year, a.score ? `★ ${a.score}` : null].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {pk && (
                    <span className={styles.sugBadge} style={{ '--brand': PLATFORMS[pk].color }}>
                      {PLATFORMS[pk].name.split(' ')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
