// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link 
            href="https://github.com/kbsooo" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.link}
          >
            <Github size={20} />
            <span>GitHub</span>
          </Link>
          <Link
            href="https://kbsoo.vercel.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.link}
          >
            Portfolio
          </Link>
        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} kbsoo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}