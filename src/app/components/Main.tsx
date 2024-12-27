// app/components/Main.tsx
"use client";

import styles from "./Main.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Main() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/main");
    }
  }, [status, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoText}>마니또</span>
          <div className={styles.gradientBar}></div>
        </div>
        
        <div className={styles.content}>
          {session && session.user ? (
            <div className={styles.userSection}>
              <h3 className={styles.welcome}>
                반가워요, <strong>{session.user.name}</strong>님!
              </h3>
              <p className={styles.message}>
                설레는 마니또의 세계로 들어가볼까요?
              </p>
              <button 
                className={`${styles.button} ${styles.logout}`}
                onClick={() => signOut()}
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className={styles.loginSection}>
              <h3 className={styles.welcome}>
                마니또에 오신 것을 환영합니다
              </h3>
              <p className={styles.message}>
                로그인하고 즐거운 마니또를 시작해보세요
              </p>
              <button 
                className={`${styles.button} ${styles.login}`}
                onClick={() => signIn()}
              >
                로그인하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}