// src/app/main/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import './style.css';
import Header from '../components/Header';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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

  return (
    <div className="pageContainer">
      <Header />
      <main className="mainContent">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="groupsGrid">
              {groups.map((group) => (
                <Link 
                  href={`/group/${group.id}`} 
                  key={group.id} 
                  className="groupCard"
                >
                  <h3>{group.name}</h3>
                  <span className="roleTag">{group.role}</span>
                </Link>
              ))}
            </div>
            <div className="buttonGroup">
              <Link href="/create" className="button createButton">
                방 만들기
              </Link>
              <Link href="/join" className="button joinButton">
                참가하기
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}