/* ANIMEX v5 — SKELETON CARD (shimmer loading placeholder) */
import styles from './SkeletonCard.module.css';

export default function SkeletonCard({ inRow = true, inGrid = false }) {
  return (
    <div className={`${styles.card} ${inRow ? styles.inRow : ''} ${inGrid ? styles.inGrid : ''}`}>
      <div className="skel-poster" />
      <div className={styles.body}>
        <div className="skel-line w80" />
        <div className="skel-line w60" />
        <div className={styles.genreRow}>
          <div className={`${styles.pill} skel-line`} style={{ width: '50px' }} />
          <div className={`${styles.pill} skel-line`} style={{ width: '40px' }} />
        </div>
        <div className="skel-line w60" style={{ height: '8px', marginTop: '4px' }} />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 8 }) {
  return (
    <div className="cards-row">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} inRow />)}
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="cards-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} inGrid />)}
    </div>
  );
}
