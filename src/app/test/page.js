'use client';

import styles from './GoldStar.module.css';

export default function TestPage() {  return (    <div className="min-h-screen grey-400 via-black flex items-center justify-end overflow-hidden" style={{paddingRight: 'calc(20% + 150px)'}}>
      {/* Opaque overlay over entire screen */}
      <div className={styles.screenOverlay}></div>
      
      <div className="relative">        {/* Main spinning 3D black box */}
        <div className={styles.spinningBox}>
          <div className={`${styles.boxFace} ${styles.front}`}></div>
          <div className={`${styles.boxFace} ${styles.back}`}></div>
          <div className={`${styles.boxFace} ${styles.right}`}></div>
          <div className={`${styles.boxFace} ${styles.left}`}></div>
          <div className={`${styles.boxFace} ${styles.top}`}></div>
          <div className={`${styles.boxFace} ${styles.bottom}`}></div>
        </div>
          {/* Four white lines on the outskirts */}
        <div className={styles.outskirtLines}>
          <div className={`${styles.line} ${styles.lineTop}`}></div>
          <div className={`${styles.line} ${styles.lineRight}`}></div>
          <div className={`${styles.line} ${styles.lineBottom}`}></div>
          <div className={`${styles.line} ${styles.lineLeft}`}></div>
          {/* Diagonal lines at 45 degree angles */}
          <div className={`${styles.line} ${styles.lineNorthEast}`}></div>
          <div className={`${styles.line} ${styles.lineSouthEast}`}></div>
          <div className={`${styles.line} ${styles.lineSouthWest}`}></div>          <div className={`${styles.line} ${styles.lineNorthWest}`}></div>        </div>
      </div>
    </div>
  );
}