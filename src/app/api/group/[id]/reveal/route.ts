import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { type NextRequest } from 'next/server';

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