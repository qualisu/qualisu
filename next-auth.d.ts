import { UserRole, User, Departments } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

export type ExtendedUser = DefaultSession['user'] & {
  role: UserRole
  dept: Departments
  isTwoFactorEnabled: boolean
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}
