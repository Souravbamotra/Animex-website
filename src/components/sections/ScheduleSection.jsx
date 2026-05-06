/* ANIMEX v5 — SCHEDULE SECTION */
import { useEffect, useState } from 'react';
import { fetchAPI } from '../../lib/api.js';
import AnimeCard from '../ui/AnimeCard.jsx';
import { SkeletonRow } from '../ui/SkeletonCard.jsx';
import SectionLabel from '../ui/SectionLabel.jsx';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function ScheduleSection() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const [activeDay, setActiveDay] = useState(today);
  const [animes, setAnimes]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAPI(`/schedules?filter=${activeDay}&limit=12`).then(d => {
      setAnimes(d?.data || []);
      setLoading(false);
    });
  }, [activeDay]);

  return (
    <section className="section" id="schedule" aria-label="Airing schedule">
      <div className="section-header">
        <div>
          <SectionLabel icon="📅" label="Weekly" color="var(--c-cyan)" />
          <h2 className="section-title">Airing Schedule</h2>
        </div>
      </div>
      <div className="filter-bar" id="schedule-filters">
        {DAYS.map((d, i) => (
          <button
            key={d}
            className={`filter-pill ${activeDay === d ? 'active' : ''}`}
            onClick={() => setActiveDay(d)}
          >
            {DAY_SHORT[i]}
          </button>
        ))}
      </div>
      {loading ? <SkeletonRow count={6} /> : (
        <div className="cards-row">
          {animes.map(a => <AnimeCard key={a.mal_id} anime={a} inRow />)}
          {animes.length === 0 && <div className="section-empty">No schedule found.</div>}
        </div>
      )}
    </section>
  );
}
