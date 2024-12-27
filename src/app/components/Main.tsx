"use client";
import styles from "./Main.module.css";
// import Link from "next/link"; 
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Main() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") {
      // 로그인 상태가 되면 /main으로 라우팅
      router.push("/main");
    }
  }, [status, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.sparkles}></div>
        <h2 className={styles.title}>
          
          <span className={styles.heartbeat}>마니또</span>
        </h2>
        {session && session.user ? (
          <div className={styles.userSection}>
            <h3 className={styles.subtitle}>
              <span className={styles.welcome}>설레는 마니또의 세계에 오신</span>
              {session.user.name}님
            </h3>
            <button 
              className={`${styles.button} ${styles.logout}`}
              onClick={() => signOut()}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button 
            className={`${styles.button} ${styles.login}`}
            onClick={() => signIn()}
          >
            로그인
          </button>
        )}
      </div>
    </div>
  );
}