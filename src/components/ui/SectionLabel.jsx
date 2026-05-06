/* ANIMEX v5 — SECTION LABEL
   Renders: | 🔥 HOT RIGHT NOW  with left border accent */
import styles from './SectionLabel.module.css';

export default function SectionLabel({ icon, label, color }) {
  return (
    <div
      className={styles.wrap}
      style={{ '--accent': color || 'var(--c-cyan)' }}
    >
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{label}</span>
    </div>
  );
}
