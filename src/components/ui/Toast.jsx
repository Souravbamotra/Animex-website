/* ANIMEX v5 — TOAST NOTIFICATIONS */
import { useAppStore } from '../../store/useAppStore.js';
import styles from './Toast.module.css';

const ICONS = { success: '✓', info: 'i', warning: '!' };

export default function ToastContainer() {
  const { toasts } = useAppStore();
  return (
    <div className={styles.container} aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{ICONS[t.type] || 'i'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
