import styles from './GoldStar.module.css';

export default function RotatingCubePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className={styles.scene}>
        <div className={styles.cube}>
          <div className={styles.face + ' ' + styles.front}></div>
          <div className={styles.face + ' ' + styles.back}></div>
          <div className={styles.face + ' ' + styles.left}></div>
          <div className={styles.face + ' ' + styles.right}></div>
          <div className={styles.face + ' ' + styles.top}></div>
          <div className={styles.face + ' ' + styles.bottom}></div>
        </div>
      </div>
    </div>
  );
}
