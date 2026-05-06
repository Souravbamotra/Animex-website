/* ANIMEX v5 — DISCOVER SECTION */
import { useEffect, useState, useCallback } from 'react';
import { fetchAPI } from '../../lib/api.js';
import { useAppStore } from '../../store/useAppStore.js';
import { detectPlatforms } from '../../lib/config.js';
import AnimeCard from '../ui/AnimeCard.jsx';
import { SkeletonGrid } from '../ui/SkeletonCard.jsx';
import SectionLabel from '../ui/SectionLabel.jsx';
import styles from './DiscoverSection.module.css';

const GENRES = [
  ['','All Genres'],['1','Action'],['2','Adventure'],['4','Comedy'],
  ['8','Drama'],['10','Fantasy'],['14','Horror'],['22','Romance'],
  ['24','Sci-Fi'],['36','Slice of Life'],['37','Supernatural'],
];
const SORTS = [['score','Top Rated'],['popularity','Most Popular'],['start_date','Newest']];
const STUDIOS = [
  ['','All Studios'],['569','MAPPA'],['43','ufotable'],['2','KyoAni'],
  ['56','A-1 Pictures'],['4','Bones'],['14','Sunrise'],['11','Madhouse'],
];
const PLATFORMS_FILTER = [['','All Platforms'],['netflix','Netflix'],['crunchyroll','Crunchyroll'],['prime','Prime'],['disney','Disney+']];

export default function DiscoverSection() {
  const { discoverFilter, setDiscoverFilter, moodActive, setMoodActive } = useAppStore();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [hasMore, setHasMore]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters]   = useState({ genre: '', sort: 'score', studio: '', platform: '' });

  const buildUrl = useCallback((pg, f, df) => {
    const { genre, sort, studio } = f;
    let params = `order_by=${sort}&limit=20&page=${pg}`;
    if (genre)  params += `&genres=${genre}`;
    if (studio) params += `&producers=${studio}`;
    if (genre || studio) return `/anime?${params}`;
    if (df === 'airing') return `/top/anime?filter=airing&limit=20&page=${pg}`;
    if (df === 'movie')  return `/top/anime?filter=bypopularity&type=movie&limit=20&page=${pg}`;
    return `/top/anime?order_by=${sort}&limit=20&page=${pg}`;
  }, []);

  const load = useCallback(async (reset = true, f = filters, df = discoverFilter) => {
    const pg = reset ? 1 : page;
    if (reset) setLoading(true); else setLoadingMore(true);
    const d = await fetchAPI(buildUrl(pg, f, df));
    let results = d?.data || [];
    if (f.platform) results = results.filter(a => detectPlatforms(a).some(p => p.key === f.platform));
    if (reset) {
      setData(results); setPage(2);
    } else {
      setData(prev => [...prev, ...results]); setPage(pg + 1);
    }
    setHasMore(results.length >= 20);
    setLoading(false); setLoadingMore(false);
  }, [page, filters, discoverFilter, buildUrl]);

  useEffect(() => { load(true, filters, discoverFilter); }, [filters, discoverFilter]);

  const updateFilter = k => v => setFilters(prev => ({ ...prev, [k]: v }));
  const reset = () => { setFilters({ genre: '', sort: 'score', studio: '', platform: '' }); setDiscoverFilter('all'); setMoodActive(null); };

  return (
    <section className="section" id="discover" aria-label="Discover anime">
      <div className="section-header">
        <div>
          <SectionLabel icon="✦" label="Explore All" color="var(--c-violet)" />
          <h2 className="section-title">Discover Anime</h2>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {[['all','All'],['airing','Airing'],['movie','Movies']].map(([f, l]) => (
          <button key={f} className={`filter-pill ${discoverFilter === f ? 'active' : ''}`} onClick={() => setDiscoverFilter(f)}>{l}</button>
        ))}
        <div className="filter-sep" />
        {[['genre', GENRES],['sort', SORTS],['studio', STUDIOS],['platform', PLATFORMS_FILTER]].map(([key, opts]) => (
          <select key={key} className="filter-select" value={filters[key]} onChange={e => updateFilter(key)(e.target.value)}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryText}>{loading ? 'Loading…' : `Showing ${data.length} anime`}</span>
        <button className={styles.resetBtn} onClick={reset}>Reset filters</button>
      </div>

      {loading ? <SkeletonGrid count={12} /> : (
        <>
          <div className="cards-grid">
            {data.map(a => <AnimeCard key={a.mal_id} anime={a} inRow={false} />)}
            {data.length === 0 && <div className="section-empty">No anime matched these filters.</div>}
          </div>
          {hasMore && (
            <div className={styles.loadMore}>
              <button className={styles.loadMoreBtn} onClick={() => load(false)} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
