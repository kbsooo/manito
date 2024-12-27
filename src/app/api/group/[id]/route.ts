// app/api/group/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { type NextRequest } from 'next/server';

export async function GET(
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

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }

    // Format the response data
    const formattedGroup = {
      id: group.id,
      name: group.name,
      isRevealManito: group.isRevealManito, // 이 필드 추가
      members: group.members.map(member => ({
        userId: member.userId,
        name: member.user.name,
        role: member.role,
        manitoId: member.manitoId,
      })),
    };

    return NextResponse.json({
      success: true,
      group: formattedGroup,
    });
  } catch (error) {
    console.error('Failed to fetch group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}