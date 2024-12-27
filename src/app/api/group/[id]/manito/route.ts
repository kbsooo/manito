// app/api/group/[id]/manito/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { type NextRequest } from 'next/server';

// 마니또 배정하기
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const groupId = parseInt(id);
    
    if (isNaN(groupId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // 그룹 정보와 멤버 가져오기
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: { userId: true, manitoId: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // 이미 마니또가 배정되어 있는지 확인
    const hasExistingManito = group.members.some(member => member.manitoId !== null);
    if (hasExistingManito) {
      return NextResponse.json(
        { success: false, error: 'Manito is already assigned' },
        { status: 400 }
      );
    }

    const members = group.members;
    if (members.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Not enough members' },
        { status: 400 }
      );
    }

    // Fisher-Yates 셔플 알고리즘으로 마니또 배정
    function getValidManitoPairs(members: { userId: string }[]): { userId: string, manitoId: string }[] {
      const shuffled = [...members];
      let currentIndex = shuffled.length;
      
      while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
      }

      // 자기 자신을 마니또로 지정하지 않도록 확인
      for (let i = 0; i < shuffled.length; i++) {
        if (shuffled[i].userId === shuffled[(i + 1) % shuffled.length].userId) {
          // 자기 자신이 마니또가 되는 경우 다시 시도
          return getValidManitoPairs(members);
        }
      }

      return shuffled.map((member, index) => ({
        userId: member.userId,
        manitoId: shuffled[(index + 1) % shuffled.length].userId
      }));
    }

    const manitoPairs = getValidManitoPairs(members);

    // 트랜잭션으로 마니또 업데이트 및 그룹 상태 변경
    await prisma.$transaction([
      ...manitoPairs.map(pair => 
        prisma.groupMember.update({
          where: {
            groupId_userId: {
              groupId,
              userId: pair.userId
            }
          },
          data: { manitoId: pair.manitoId }
        })
      ),
      prisma.group.update({
        where: { id: groupId },
        data: { isRevealManito: false }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to assign manito:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign manito' },
      { status: 500 }
    );
  }
}

// 마니또 공개하기
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const groupId = parseInt(id);
    
    if (isNaN(groupId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid group ID' },
        { status: 400 }
      );
    }

    // 마니또가 모두 배정되어 있는지 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          select: { manitoId: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    const allMemberHaveManito = group.members.every(member => member.manitoId !== null);
    if (!allMemberHaveManito) {
      return NextResponse.json(
        { success: false, error: 'Not all members have manito assigned' },
        { status: 400 }
      );
    }

    await prisma.group.update({
      where: { id: groupId },
      data: { isRevealManito: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reveal manito:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reveal manito' },
      { status: 500 }
    );
  }
}