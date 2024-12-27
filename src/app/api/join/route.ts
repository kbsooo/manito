// app/api/join/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, groupId, password } = body;

    if (!userId || !groupId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Group ID are required' },
        { status: 400 }
      );
    }

    // 그룹 존재 여부 확인
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 그룹입니다.' },
        { status: 404 }
      );
    }

    // 비밀번호가 설정된 그룹인 경우 비밀번호 확인
    if (group.password && group.password !== password) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 403 }
      );
    }

    // 이미 가입된 멤버인지 확인
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: '이미 가입된 그룹입니다.' },
        { status: 400 }
      );
    }

    // 그룹에 멤버 추가
    const member = await prisma.groupMember.create({
      data: {
        groupId: groupId,
        userId: userId,
        role: 'MEMBER',
      },
    });

    return NextResponse.json({
      success: true,
      member: member,
    });
  } catch (error) {
    console.error('Failed to join group:', error);
    return NextResponse.json(
      { success: false, error: '그룹 가입에 실패했습니다.' },
      { status: 500 }
    );
  }
}