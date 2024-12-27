"use client";

import styles from "./Main.module.css";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect} from "react";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";

const SnowEffect = () => {
  return (
    <div className={styles.snowContainer}>
      {[...Array(50)].map((_, i) => (
        <div key={i} className={styles.snowflake} style={{
          // '--delay': `${Math.random() * 5}s`,
          // '--duration': `${8 + Math.random() * 4}s`,
          // '--left': `${Math.random() * 100}%`,
        }} />
      ))}
    </div>
  );
};

export default function Main() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/main");
    }
  }, [status, router]);



return (
  <div className={styles.pageWrapper}>
    <div className={styles.container}>
      <SnowEffect />
      <div className={styles.content}>
        <div className={styles.logoArea}>
          <div className={styles.giftBox}>
            {
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.giftIcon}>
              {/* 리본 상단 */}
              <path d="M60 25C60 25 45 10 30 10C15 10 10 20 10 25C10 30 15 35 30 35H60" fill="#D04848"/>
              <path d="M60 25C60 25 75 10 90 10C105 10 110 20 110 25C110 30 105 35 90 35H60" fill="#B31312"/>
              {/* 선물상자 */}
              <rect x="15" y="35" width="90" height="75" rx="4" fill="#EE2B2B"/>
              {/* 수직 리본 */}
              <rect x="50" y="35" width="20" height="75" fill="#D04848"/>
              {/* 리본 중앙 */}
              <rect x="50" y="25" width="20" height="10" fill="#B31312"/>
              {/* 장식 무늬 */}
              <circle cx="35" cy="60" r="5" fill="#F3C1C1"/>
              <circle cx="85" cy="60" r="5" fill="#F3C1C1"/>
              <circle cx="35" cy="90" r="5" fill="#F3C1C1"/>
              <circle cx="85" cy="90" r="5" fill="#F3C1C1"/>
            </svg>
            }
          </div>
          <span className={styles.logoText}>마니또</span>
        </div>
        
        <button 
          className={`${styles.button} ${session ? styles.logout : styles.login}`}
          onClick={() => session ? signOut() : signIn()}
        >
          {session ? "로그아웃" : "시작하기"}
        </button>
      </div>
    </div>
    <Footer />
  </div>
);
}