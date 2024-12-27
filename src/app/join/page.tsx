// app/join/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/app/components/Header';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">{group.name} 그룹 가입</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {group.hasPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required={group.hasPassword}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-md text-white font-medium
                ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
                transition-colors duration-200`}
            >
              {loading ? '처리 중...' : '가입하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-md text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
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
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        if (data.success) {
          setGroups(data.groups);
        }
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
      headers: {
        'Content-Type': 'application/json',
      },
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
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">참여 가능한 그룹</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow 
                ${group.isJoined ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              onClick={() => !group.isJoined && setSelectedGroup(group)}
            >
              <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {group.hasPassword ? '비밀번호 필요' : '비밀번호 없음'}
                </div>
                {group.isJoined && (
                  <span className="text-sm text-green-600 font-medium">
                    이미 가입됨
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedGroup && (
          <JoinModal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onJoin={handleJoin}
          />
        )}
      </main>
    </div>
  );
}