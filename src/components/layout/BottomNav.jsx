/* ANIMEX v5 — BOTTOM NAV (Mobile) */
import { useAppStore } from '../../store/useAppStore.js';
import styles from './BottomNav.module.css';

export default function BottomNav({ onRandomAnime }) {
  const { toggleSearch } = useAppStore();
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const items = [
    { label: 'Home',    icon: '⬡', action: () => scrollTo('hero') },
    { label: 'Search',  icon: null, action: toggleSearch, svg: true },
    { label: 'Discover',icon: '✦', action: () => scrollTo('discover') },
    { label: 'List',    icon: '♥', action: () => scrollTo('watchlist-section') },
    { label: 'Random',  icon: '⟳', action: onRandomAnime },
  ];

  return (
    <div id="bottom-nav" className={styles.nav} role="navigation" aria-label="Mobile navigation">
      {items.map(item => (
        <button key={item.label} className={styles.btn} onClick={item.action}>
          <span className={styles.icon}>
            {item.svg ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : item.icon}
          </span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
