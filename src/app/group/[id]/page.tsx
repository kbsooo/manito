//app/group/[id]/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

interface Member {
  userId: string;
  name: string;
  role: string;
  manitoId?: string | null;
}

interface GroupData {
  id: number;
  name: string;
  members: Member[];
  isRevealManito: boolean;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function GroupDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchGroupData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/group/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch group data');
      }
      
      if (data.success) {
        console.log('Fetched group data:', data.group);
        setGroupData(data.group);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id, session?.user?.id]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleAssignManito = async () => {
    if (!groupData || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/group/${params.id}/manito`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign manito');
      }
      
      if (data.success) {
        await fetchGroupData();
      }
    } catch (error) {
      console.error('Assign error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign manito');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevealManito = async () => {
    if (!groupData || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/group/${params.id}/manito`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reveal manito');
      }
      
      if (data.success) {
        await fetchGroupData();
      }
    } catch (error) {
      console.error('Reveal error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reveal manito');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupData || isProcessing || !confirm('정말로 그룹을 삭제하시겠습니까?')) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/group/${params.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete group');
      }
      
      if (data.success) {
        router.push('/main');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete group');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!groupData) return <div className="p-4">Group not found</div>;

  const currentMember = groupData.members.find(
    member => member.userId === session?.user?.id
  );
  const isCaptain = currentMember?.role === 'CAPTAIN';
  const hasAnyManito = groupData.members.some(member => member.manitoId !== null);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{groupData.name}</h1>
        
        {isCaptain && (
          <div className="mb-6 space-x-4">
            {!groupData.isRevealManito && !hasAnyManito && (
              <button
                onClick={handleAssignManito}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isProcessing ? '처리 중...' : '마니또 뽑기'}
              </button>
            )}
            {!groupData.isRevealManito && hasAnyManito && (
              <button
                onClick={handleRevealManito}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {isProcessing ? '처리 중...' : '마니또 공개'}
              </button>
            )}
            {groupData.isRevealManito && (
              <button
                onClick={handleDeleteGroup}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400"
              >
                {isProcessing ? '처리 중...' : '그룹 삭제'}
              </button>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">참가자 목록</h2>
          <div className="space-y-3">
            {groupData.members.map((member) => (
              <div 
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{member.name}</span>
                  {currentMember?.userId === member.userId && 
                   member.manitoId && 
                   !groupData.isRevealManito && (
                    <span className="text-sm text-blue-600">
                      마니또: {groupData.members.find(m => m.userId === member.manitoId)?.name}
                    </span>
                  )}
                  {groupData.isRevealManito && member.manitoId && (
                    <span className="text-sm text-gray-500">
                      → {groupData.members.find(m => m.userId === member.manitoId)?.name}
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  member.role === 'CAPTAIN' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}