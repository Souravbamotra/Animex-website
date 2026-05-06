/* ANIMEX v5 — PLATFORM BADGE (CSS text, no emoji) */
import styles from './PlatformBadge.module.css';
import { PLATFORMS } from '../../lib/config.js';

export default function PlatformBadge({ platformKey, fallback = false }) {
  const info = PLATFORMS[platformKey];
  if (!info) return null;
  return (
    <span
      className={`${styles.badge} ${styles[platformKey]} ${fallback ? styles.fallback : ''}`}
      style={{ '--brand': info.color }}
    >
      {info.name.split(' ')[0].toUpperCase()}
    </span>
  );
}
