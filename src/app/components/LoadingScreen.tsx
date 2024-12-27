// components/LoadingScreen.tsx
import React from 'react';
import styles from './LoadingScreen.module.css';
import Header from '@/app/components/Header';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = '잠시만 기다려주세요' }: LoadingScreenProps) {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.giftBox}>
          <div className={styles.box}>
            <div className={styles.ribbon}>
              <div className={`${styles.ribbonTail} ${styles.left}`}></div>
              <div className={`${styles.ribbonTail} ${styles.right}`}></div>
            </div>
          </div>
        </div>

        <div className={styles.message}>
          <h2 className={styles.title}>Secret Santa</h2>
          <p className={styles.subtitle}>{message}</p>
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        </div>
      </div>
    </div>
  );
}