/* ANIMEX v5 — FOOTER */
import styles from './Footer.module.css';

export default function Footer() {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <div className={styles.brand}>ANIMEX</div>
          <p className={styles.desc}>
            Your premium anime discovery hub. Find what to watch across all major legal streaming platforms.
          </p>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Platforms</h4>
          <ul className={styles.list}>
            {[['Crunchyroll','https://crunchyroll.com'],['Netflix','https://netflix.com'],['Prime Video','https://primevideo.com'],['Disney+','https://disneyplus.com'],['HIDIVE','https://hidive.com']].map(([n,u]) => (
              <li key={n}><a href={u} target="_blank" rel="noopener noreferrer">{n}</a></li>
            ))}
          </ul>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Discover</h4>
          <ul className={styles.list}>
            {[['Trending','trending'],['Top Rated','top-rated'],['Explore','discover']].map(([n,id]) => (
              <li key={n}><a href={`#${id}`} onClick={e => { e.preventDefault(); scrollTo(id); }}>{n}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2025 ANIMEX. Data by Jikan API. All rights to respective creators.</p>
        <p><span style={{ color: 'var(--c-green)' }}>✓</span> Official &amp; legal streams only</p>
      </div>
    </footer>
  );
}
