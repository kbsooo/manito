// import  {NextResponse} from 'next/server'
// import prisma from "@/app/lib/prisma";

// interface RequestBody {
//   name: string;
//   password?: string;
//   userId: string;
// }

// export async function POST(request: Request) {
//   try {
//     const body: RequestBody = await request.json();

//     if (!body.name) {
//       return NextResponse.json(
//         { error: 'name is missing' },
//         { status: 400 }
//       )
//     } else if (!body.password) {
//       return NextResponse.json(
//         { error: 'password is missing' },
//         { status: 400 }
//       )
//     } else if (!body.userId) {
//       return NextResponse.json(
//         { error: 'userId is missing' },
//         { status: 400 }
//       )
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       const group = await tx.group.create({
//         data: {
//           name: body.name,
//           password: body.password,
//         },
//       })

//       const groupMember = await tx.groupMember.create({
//         data: {
//           groupId: group.id,
//           userId: body.userId,
//           role: 'CAPTAIN',
//         },
//         include: {
//           group: true,
//           user: true,
//         },
//       })
//       return groupMember
//     })
//     return NextResponse.json(result)
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       return NextResponse.json(
//         { error: 'name already exists' },
//         { status: 400 }
//       )
//     }

//     console.error('error creating gruop', error)
//     return NextResponse.json(
//       { error: 'iinternal server error' },
//       { status: 500}
//     )
//   }
// }
// app/api/create/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/app/lib/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

interface RequestBody {
  name: string;
  password?: string;
  userId: string;  // captain이 될 user의 id
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json()

    // 필수 필드 검증
    if (!body.name || !body.userId) {
      return NextResponse.json({
        success: false,
        error: 'Name and userId are required'
      }, { status: 400 })
    }

    // 트랜잭션으로 그룹 생성과 멤버 추가를 atomic하게 실행
    const result = await prisma.$transaction(async (tx) => {
      // 1. 그룹 생성
      const group = await tx.group.create({
        data: {
          name: body.name,
          password: body.password,
        },
      })

      // 2. Captain으로 user 추가
      const groupMember = await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId: body.userId,
          role: 'CAPTAIN',
        },
        include: {
          group: true,
          user: true,
        },
      })

      return groupMember
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    if (!(error instanceof Error)) {
      return NextResponse.json({
        success: false,
        error: 'Unknown error occurred'
      }, { status: 500 })
    }

    const prismaError = error as PrismaClientKnownRequestError
    
    // unique constraint 위반 (그룹 이름 중복) 체크
    if (prismaError.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Group name already exists'
      }, { status: 400 })
    }

    // 존재하지 않는 userId인 경우
    if (prismaError.code === 'P2003') {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // 기타 에러
    console.error('Error creating group:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}