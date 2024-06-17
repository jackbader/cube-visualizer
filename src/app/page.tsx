'use client';

import styles from './page.module.css';
import ThreeScene from './three-scene';

export default function Home() {
  return (
    <div className={styles.scene}>
      <ThreeScene />
    </div>
  );
}
