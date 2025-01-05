import NextAuth from 'next-auth'
import { Departments, UserRole } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'

import authConfig from '@/auth.config'
import { db } from '@/lib/db'
import { getUserById } from './data/user'
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation'

export const { handlers, auth, signIn, signOut } = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') return true

      const existingUser = await getUserById(user.id)

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )

        if (!twoFactorConfirmation) return false

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        })
      }

      return true
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }

      if (token.dept && session.user) {
        session.user.dept = token.dept as Departments
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }

      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUserById(token.sub)
      if (!existingUser) return token

      token.name = existingUser.name
      token.email = existingUser.email
      token.role = existingUser.role
      token.dept = existingUser.dept
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

      return token
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig
})
