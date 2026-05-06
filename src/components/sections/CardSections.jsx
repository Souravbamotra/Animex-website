/* ANIMEX v5 — TRENDING / TOP RATED SECTIONS (shared) */
import { useEffect, useState } from 'react';
import { fetchAPI } from '../../lib/api.js';
import AnimeCard from '../ui/AnimeCard.jsx';
import { SkeletonRow } from '../ui/SkeletonCard.jsx';
import SectionLabel from '../ui/SectionLabel.jsx';

export function TrendingSection() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/top/anime?filter=airing&limit=14').then(d => {
      setAnimes(d?.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <section className="section" id="trending" aria-label="Trending anime">
      <div className="section-header">
        <div>
          <SectionLabel icon="🔥" label="Hot Right Now" color="var(--c-orange)" />
          <h2 className="section-title">Trending Anime</h2>
        </div>
      </div>
      {loading ? <SkeletonRow count={8} /> : (
        <div className="cards-row">
          {animes.map(a => <AnimeCard key={a.mal_id} anime={a} inRow />)}
        </div>
      )}
    </section>
  );
}

export function TopRatedSection() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI('/top/anime?limit=14').then(d => {
      setAnimes(d?.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <section className="section" id="top-rated" aria-label="Top rated anime">
      <div className="section-header">
        <div>
          <SectionLabel icon="⭐" label="Best Ever" color="var(--c-gold)" />
          <h2 className="section-title">Top Rated</h2>
        </div>
      </div>
      {loading ? <SkeletonRow count={8} /> : (
        <div className="cards-row">
          {animes.map(a => <AnimeCard key={a.mal_id} anime={a} inRow />)}
        </div>
      )}
    </section>
  );
}
