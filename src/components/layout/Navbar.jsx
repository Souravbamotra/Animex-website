/* ANIMEX v5 — NAVBAR */
import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore.js';
import styles from './Navbar.module.css';

const SECTIONS = [
  { id: 'hero',      label: 'Home' },
  { id: 'trending',  label: 'Trending' },
  { id: 'discover',  label: 'Discover' },
  { id: 'top-rated', label: 'Top Rated' },
];

export default function Navbar({ onRandomAnime }) {
  const { watchlist, toggleSearch } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id, e) => {
    e?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
  };

  return (
    <nav
      id="navbar"
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.logo}>ANIMEX</div>

      <div className={styles.center}>
        {SECTIONS.map(s => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`${styles.link} ${activeSection === s.id ? styles.active : ''}`}
            onClick={e => scrollTo(s.id, e)}
          >
            {s.label}
          </a>
        ))}
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={toggleSearch}
          title="Search (Ctrl+K)"
          aria-label="Search"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          className={styles.iconBtn}
          onClick={onRandomAnime}
          title="Random Anime"
          aria-label="Random Anime"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/>
            <path d="m18 2 4 4-4 4"/>
            <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/>
            <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/>
            <path d="m18 14 4 4-4 4"/>
          </svg>
        </button>

        <button
          className={styles.watchlistBtn}
          onClick={() => document.getElementById('watchlist-section')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="My Watchlist"
        >
          <span>♥ List</span>
          {watchlist.length > 0 && (
            <span className={styles.badge}>{watchlist.length}</span>
          )}
        </button>
      </div>
    </nav>
  );
}
