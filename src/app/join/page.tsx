// app/join/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import styles from './Join.module.css';
import LoadingScreen from '../components/LoadingScreen';

interface Group {
  id: number;
  name: string;
  hasPassword: boolean;
  isJoined: boolean;
}

interface JoinModalProps {
  group: Group;
  onClose: () => void;
  onJoin: (password?: string) => Promise<void>;
}

function JoinModal({ group, onClose, onJoin }: JoinModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onJoin(password);
    } catch (error) {
      setError(error instanceof Error ? error.message : '가입에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{group.name} 그룹 가입</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {group.hasPassword && (
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required={group.hasPassword}
              />
            </div>
          )}

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.button} ${styles.joinButton}`}
            >
              {loading ? '처리 중...' : '가입하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JoinGroupPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/group?type=all${session?.user?.id ? `&userId=${session.user.id}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        if (data.success) setGroups(data.groups);
      } catch (error) {
        setError('그룹 목록을 불러오는데 실패했습니다.');
        console.error('Failed to fetch groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [session]);

  const handleJoin = async (password?: string) => {
    if (!session?.user?.id || !selectedGroup) return;

    const response = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session.user.id,
        groupId: selectedGroup.id,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '그룹 가입에 실패했습니다.');
    }

    if (data.success) {
      router.push(`/group/${selectedGroup.id}`);
    }
  };

  if (loading) {
    return <LoadingScreen message="그룹 목록을 불러오는 중입니다" />;
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>참여 가능한 그룹</h1>
          <p className={styles.subtitle}>
            참여하고 싶은 그룹을 선택하여 마니또를 시작해보세요
          </p>
        </div>
        
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.grid}>
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => !group.isJoined && setSelectedGroup(group)}
                className={`${styles.card} ${group.isJoined ? styles.joined : ''}`}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.groupName}>{group.name}</h2>
                  <div className={`${styles.passwordIcon} ${!group.hasPassword ? styles.noPasswordIcon : ''}`} />
                </div>
                
                <div className={styles.cardFooter}>
                  <span className={`${styles.joinStatus} ${group.isJoined ? styles.joinedStatus : ''}`}>
                    {group.isJoined ? '이미 가입됨' : '참여 가능'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedGroup && (
          <JoinModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onJoin={handleJoin}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}