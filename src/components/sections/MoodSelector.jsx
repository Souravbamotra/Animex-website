/* ANIMEX v5 — MOOD SELECTOR + PLATFORM TICKER */
import { useAppStore } from '../../store/useAppStore.js';
import styles from './MoodSelector.module.css';

const MOODS = [
  { id: 'action',  emoji: '⚡', label: 'Action' },
  { id: 'romance', emoji: '💕', label: 'Romance' },
  { id: 'dark',    emoji: '🌑', label: 'Dark & Intense' },
  { id: 'comedy',  emoji: '😄', label: 'Comedy' },
  { id: 'fantasy', emoji: '🐉', label: 'Fantasy' },
  { id: 'chill',   emoji: '🍃', label: 'Chill' },
  { id: 'scifi',   emoji: '🚀', label: 'Sci-Fi' },
  { id: 'horror',  emoji: '💀', label: 'Horror' },
];

const MOOD_GENRE_IDS = {
  action: '1', romance: '22', dark: '40', comedy: '4',
  fantasy: '10', chill: '36', scifi: '24', horror: '14'
};

export function MoodSelector() {
  const { moodActive, setMoodActive, addToast } = useAppStore();

  const applyMood = (id, emoji) => {
    if (moodActive === id) { setMoodActive(null); }
    else {
      setMoodActive(id);
      addToast(`Mood: ${emoji} ${id}`, 'info');
      document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.section} id="mood-section">
      <h3 className={styles.heading}>What's your <em>mood</em> today?</h3>
      <div className={styles.row}>
        {MOODS.map(m => (
          <button
            key={m.id}
            className={`${styles.btn} ${moodActive === m.id ? styles.active : ''}`}
            onClick={() => applyMood(m.id, m.emoji)}
          >
            <span className={styles.emoji}>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PlatformTicker() {
  const items = ['NETFLIX','CRUNCHYROLL','PRIME VIDEO','DISNEY+','HIDIVE','YOUTUBE'];
  const cls   = ['netflix','crunchyroll','prime','disney','hidive','youtube'];
  const doubled = [...items, ...items];
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.tickerTrack}>
        {doubled.map((name, i) => (
          <div key={i} className={`${styles.tickerItem} ${styles[cls[i % cls.length]]}`}>
            <span className={styles.tickerDot} />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
