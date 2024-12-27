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
          <Link href="/main">마니또</Link>
        </div>

        <nav className={styles.nav}>
          {/* 로그인 상태에 따라 다른 버튼/메시지 표시 */}
          {session && session.user ? (
            <div className={styles.userSection}>
              <span className={styles.welcome}>
                안녕하세요, <strong>{session.user.name}</strong>님
              </span>
              <button className={styles.button} onClick={() => signOut( {callbackUrl: "/"} )}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className={styles.button} onClick={() => signIn()}>
              로그인
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}