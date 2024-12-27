// app/api/[...nextauth]/route.ts
import NextAuth from 'next-auth/next'
import KakaoProvider from 'next-auth/providers/kakao'
import prisma from '@/app/lib/prisma'

const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,  
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
    async signIn({ user, account }) {
      try {
        if (!user || !account) return false

        const kakaoId = account.providerAccountId

        // 사용자가 있는지 확인
        const existingUser = await prisma.user.findUnique({
          where: {
            id: kakaoId
          }
        })

        if (!existingUser) {
          // 없으면 새로 생성
          await prisma.user.create({
            data: {
              id: kakaoId,
              name: user.name || 'Anonymous',
            }
          })
        }

        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
    }
  }
})

export { handler as GET, handler as POST }