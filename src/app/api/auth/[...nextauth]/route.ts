import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: '2FA',
      credentials: {
        challengeId: { label: "Challenge ID", type: "text" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.challengeId || !credentials?.code) {
          throw new Error('Missing challenge credentials')
        }

        const challenge = await prisma.loginChallenge.findUnique({
          where: { id: credentials.challengeId },
          include: { user: true }
        })

        if (!challenge) throw new Error('Reto inválido o expirado')
        if (challenge.used) throw new Error('El reto ya fue utilizado')
        if (new Date() > challenge.expiresAt) throw new Error('El código ha expirado')
        if (challenge.attempts >= 5) throw new Error('Demasiados intentos fallidos')

        await prisma.loginChallenge.update({
          where: { id: challenge.id },
          data: { attempts: { increment: 1 } }
        })

        const isValidCode = await bcrypt.compare(credentials.code, challenge.code)
        if (!isValidCode) {
          throw new Error('Código incorrecto')
        }

        await prisma.loginChallenge.update({
          where: { id: challenge.id },
          data: { used: true }
        })

        return {
          id: challenge.user.id,
          email: challenge.user.email,
          roleName: challenge.user.roleName
        }
      }
    })
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 1 día (en segundos)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roleName = (user as any).roleName
        token.id = user.id
      }

      // Verificamos si el partner fue suspendido luego de iniciar sesión
      if (token.id) {
        const partner = await prisma.partner.findUnique({ where: { userId: token.id as string } })
        if (partner?.status === 'SUSPENDED' || partner?.status === 'RETIRED') {
          token.isSuspended = true
        } else {
          token.isSuspended = false
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.isSuspended) {
        return {} as any; // Destruye la sesión
      }

      if (session.user) {
        (session.user as any).roleName = token.roleName;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
