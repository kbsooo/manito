// app/components/Header.tsx
"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { useSession, signOut, signIn } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/main">
            <span className={styles.logoText}>마니또</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          {session && session.user ? (
            <div className={styles.userSection}>
              <span className={styles.welcome}>
                반가워요, <strong>{session.user.name}</strong>님!
              </span>
              <button 
                className={styles.button} 
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button 
              className={styles.button} 
              onClick={() => signIn()}
            >
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}