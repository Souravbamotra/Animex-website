/* ANIMEX v5 — WATCHLIST SECTION */
import { useRef } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import AnimeCard from '../ui/AnimeCard.jsx';
import SectionLabel from '../ui/SectionLabel.jsx';
import styles from './WatchlistSection.module.css';

export default function WatchlistSection() {
  const { watchlist, clearWatchlist, exportWatchlist, importWatchlist, recent, clearRecent } = useAppStore();
  const fileRef = useRef(null);

  const handleImport = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target.result);
        importWatchlist(parsed);
      } catch { useAppStore.getState().addToast('Invalid file format', 'warning'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!watchlist.length && !recent.length) return null;

  return (
    <>
      {recent.length > 0 && (
        <section className="section" id="recently-section" aria-label="Recently viewed">
          <div className="section-header">
            <div>
              <SectionLabel icon="🕐" label="Your History" color="var(--t-dim)" />
              <h2 className="section-title">Recently Viewed</h2>
            </div>
            <button className="section-cta" onClick={clearRecent}>Clear</button>
          </div>
          <div className="cards-row">
            {recent.map(a => <AnimeCard key={a.mal_id} anime={a} inRow />)}
          </div>
        </section>
      )}

      {watchlist.length > 0 && (
        <section className="section" id="watchlist-section" aria-label="Your watchlist">
          <div className={styles.header}>
            <div>
              <SectionLabel icon="♥" label="Saved" color="var(--c-pink)" />
              <h2 className="section-title">Your Watchlist</h2>
            </div>
            <div className={styles.controls}>
              <input
                type="text"
                placeholder="MAL Username"
                className={styles.malInput}
                onKeyDown={async e => {
                  if (e.key === 'Enter') {
                    const { fetchAPI } = await import('../../lib/api.js');
                    const d = await fetchAPI(`/users/${e.target.value}/animelist/all`);
                    if (!d?.data) { useAppStore.getState().addToast('User not found', 'warning'); return; }
                    // merge
                  }
                }}
              />
              <button className="section-cta" onClick={exportWatchlist}>Export</button>
              <button className="section-cta" onClick={() => fileRef.current?.click()}>Import</button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
              <button className="section-cta" style={{ borderColor: 'var(--c-pink)', color: 'var(--c-pink)' }} onClick={clearWatchlist}>Clear All</button>
            </div>
          </div>
          <div className="cards-row">
            {watchlist.map(a => <AnimeCard key={a.mal_id} anime={a} inRow />)}
          </div>
        </section>
      )}
    </>
  );
}
