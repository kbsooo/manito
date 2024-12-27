// src/app/main/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import './style.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import LoadingScreen from '@/app/components/LoadingScreen';

interface Group {
  id: number;
  name: string;
  role: string;
}

export default function Page() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/group?userId=${session.user.id}&type=joined`);
          const data = await response.json();
          if (data.success) {
            setGroups(data.groups);
          }
        } catch (error) {
          console.error('Failed to fetch groups:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGroups();
  }, [session]);

  if (loading) {
    return <LoadingScreen message="나의 마니또 그룹을 불러오는 중입니다" />;
  }

  return (
    <div className="pageContainer">
      <Header />
      <main className="mainContent">
        <div className="groupsSection">
          <h2 className="sectionTitle">나의 마니또 그룹</h2>
          {groups.length > 0 ? (
            <div className="groupsGrid">
              {groups.map((group) => (
                <Link 
                  href={`/group/${group.id}`} 
                  key={group.id} 
                  className="groupCard"
                >
                  <div className="groupCardContent">
                    <h3 className="groupName">{group.name}</h3>
                    <span className={`roleTag ${group.role.toLowerCase()}`}>
                      {group.role}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <p>아직 참여중인 그룹이 없어요</p>
              <p>새로운 그룹을 만들거나 참여해보세요!</p>
            </div>
          )}
        </div>

        <div className="buttonContainer">
          <Link href="/create" className="button createButton">
            새 그룹 만들기
          </Link>
          <Link href="/join" className="button joinButton">
            그룹 참가하기
          </Link>
        </div>
      </main>  
      <Footer />
    </div>
  );
}