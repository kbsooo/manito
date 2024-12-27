// app/api/group/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const type = searchParams.get('type'); // 'all' 또는 'joined'

  if (type === 'joined' && !userId) {
    return NextResponse.json(
      { success: false, error: 'User ID is required for joined groups' },
      { status: 400 }
    );
  }

  try {
    if (type === 'joined') {
      // 사용자가 가입한 그룹 목록
      const groups = await prisma.groupMember.findMany({
        where: {
          userId: userId!,
        },
        include: {
          group: true,
        },
      });

      const formattedGroups = groups.map(membership => ({
        id: membership.groupId,
        name: membership.group.name,
        role: membership.role,
      }));

      return NextResponse.json({
        success: true,
        groups: formattedGroups,
      });
    } else {
      // 전체 그룹 목록
      const allGroups = await prisma.group.findMany({
        select: {
          id: true,
          name: true,
          password: true,
          members: userId ? {
            where: {
              userId: userId,
            },
            select: {
              userId: true,
            },
          } : false,
        },
      });

      const formattedGroups = allGroups.map(group => ({
        id: group.id,
        name: group.name,
        hasPassword: !!group.password,
        isJoined: userId ? group.members.length > 0 : false,
      }));

      return NextResponse.json({
        success: true,
        groups: formattedGroups,
      });
    }
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}