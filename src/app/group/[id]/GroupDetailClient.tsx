// src/app/group/[id]/GroupDetailClient.tsx
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import SecretManitoModal from '@/app/components/SecretManitoModal';
import LoadingScreen from '@/app/components/LoadingScreen';

type Props = {
  params: { id: string };
};

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

// type PageProps = {
//   params: {
//     id: string;
//   };
//   searchParams: { [key: string]: string | string[] | undefined };
// };

// type Props = {
//   params: { id: string }
//   searchParams: { [key: string]: string | string[] | undefined }
// }

export default function GroupDetailPage({params}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'reveal' | 'assign'>('assign');

  const checkAndShowManitoModal = useCallback((groupData: GroupData) => {
    if (!session?.user?.id) return;
    
    const currentMember = groupData.members.find(
      member => member.userId === session.user.id
    );
    
    if (!currentMember?.manitoId) return;

    const storageKey = `manito-checked-${groupData.id}-${session.user.id}`;
    const hasCheckedManito = localStorage.getItem(storageKey);

    if (!hasCheckedManito && !groupData.isRevealManito) {
      setModalType('assign');
      setShowModal(true);
    }
  }, [session?.user?.id]);

  const handleModalClose = useCallback(() => {
    if (!session?.user?.id || !groupData) return;
    
    // 모달을 닫을 때 로컬 스토리지에 확인 여부 저장
    const storageKey = `manito-checked-${groupData.id}-${session.user.id}`;
    localStorage.setItem(storageKey, 'true');
    setShowModal(false);
  }, [session?.user?.id, groupData]);

  const fetchGroupData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/group/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch group data');
      }

      if (data.success) {
        setGroupData(data.group);
        // 데이터를 가져온 후 마니또 모달 표시 여부 확인
        checkAndShowManitoModal(data.group);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id, session?.user?.id, checkAndShowManitoModal]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleRevealManito = async () => {
    if (!groupData || isProcessing) return;
  
    setIsProcessing(true);
    try {
      setModalType('reveal');
      setShowModal(true);
      
      const { id } = params;
      const response = await fetch(`/api/group/${id}/manito`, {
        method: 'PATCH',
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to reveal manito');
        } catch (e) {
          console.error('Parse error:', e);
          throw new Error(`Failed to reveal manito: ${errorText}`);
        }
      }
  
      const data = await response.json();
      
      if (data.success) {
        setTimeout(async () => {
          await fetchGroupData();
          setShowModal(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Reveal error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reveal manito');
      setShowModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupData || isProcessing) return;

    setIsProcessing(true);
    try {
      const { id } = params;
      const response = await fetch(`/api/group/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete group');
      }

      if (data.success) {
        // 성공 시 다른 페이지로 이동 (예: 그룹 목록 페이지)
        alert('그룹이 삭제되었습니다.');
        router.push('/main');
        
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete group');
    } finally {
      setIsProcessing(false);
    }
  };

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
        setModalType('assign');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Assign error:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign manito');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="그룹 정보를 불러오는 중입니다" />;
  }
  if (error) {
    return <LoadingScreen message={`오류가 발생했습니다: ${error}`} />;
  }
  if (!groupData) {
    return <LoadingScreen message="그룹을 찾을 수 없습니다" />;
  }

  const currentMember = groupData.members.find(
    member => member.userId === session?.user?.id
  );
  const isCaptain = currentMember?.role === 'CAPTAIN';
  const hasAnyManito = groupData.members.some(member => member.manitoId !== null);
  const myManito = currentMember?.manitoId 
    ? groupData.members.find(m => m.userId === currentMember.manitoId)?.name 
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 text-black">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#ff6b6b] to-[#ff8e8e] text-transparent bg-clip-text mb-2">
            {groupData.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="inline-flex items-center">
              👥 현재 인원 {groupData.members.length}명
            </span>
            {!groupData.isRevealManito && hasAnyManito && (
              <span className="inline-flex items-center text-blue-600">
                • 마니또 진행중
              </span>
            )}
            {groupData.isRevealManito && (
              <span className="inline-flex items-center text-green-600">
                • 마니또 공개됨
              </span>
            )}
          </div>
        </div>
      </div>

      {isCaptain && (
          <div className="mb-6 space-x-4">
            {!groupData.isRevealManito && groupData.members.length > 1 && !hasAnyManito && (
              <button
                onClick={handleAssignManito}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? '처리 중...' : '🎭 마니또 뽑기'}
              </button>
            )}
            {!groupData.isRevealManito && hasAnyManito && (
              <button
                onClick={handleRevealManito}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all duration-200 transform hover:scale-105"
              >
                {isProcessing ? '처리 중...' : '🎉 마니또 공개'}
              </button>
            )}
            {(groupData.isRevealManito || groupData.members.length === 1) && (
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

        <div className="bg-white rounded-lg shadow p-6 text-black">
          <h2 className="text-xl font-semibold mb-4 text-black">참가자 목록</h2>
          <div className="space-y-3">
            {groupData.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-black">{member.name}</span>
                  {currentMember?.userId === member.userId &&
                      member.manitoId &&
                      !groupData.isRevealManito && (
                        <span className="ml-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                          🎭 마니또: {groupData.members.find(m => m.userId === member.manitoId)?.name}
                        </span>
                    )}
                  {groupData.isRevealManito && member.manitoId && (
                    <span className="text-sm text-gray-500">
                      → {groupData.members.find(m => m.userId === member.manitoId)?.name}
                    </span>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    member.role === 'CAPTAIN'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {member.role === 'CAPTAIN' ? '👑 ' : ''}{member.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <SecretManitoModal 
        isOpen={showModal}
        onClose={handleModalClose}
        manitoName={myManito || ''}
        type={modalType}
      />
      </main>
    </div>
  );
}