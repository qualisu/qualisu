'use server'

import { db } from '@/lib/db'
import { UserGroups, Points, User as PrismaUser } from '@prisma/client'
import bcrypt from 'bcrypt'

export type User = Omit<PrismaUser, 'userGroups'> & {
  userGroups: (UserGroups & { points: Points[] })[]
}

export type UserUpdate = User & {
  password?: string
  emailVerified?: Date | null
  userGroups?: UserGroups[]
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await db.user.findMany({
      include: { userGroups: { include: { points: true } } }
    })

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export const updateUser = async (user: UserUpdate): Promise<User> => {
  'use server'

  try {
    const updateData: any = {
      name: user.name,
      role: user.role,
      dept: user.dept,
      emailVerified: user.emailVerified
    }

    if (user.userGroups !== undefined) {
      updateData.userGroups = {
        set: user.userGroups.map((group) => ({ id: group.id }))
      }
    }

    if (user.password) {
      updateData.password = await bcrypt.hash(user.password, 10)
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id
      },
      data: updateData,
      include: {
        userGroups: {
          include: {
            points: true
          }
        }
      }
    })

    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

export const createUser = async (data: {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'VIEWER' | 'EDITOR' | 'MOBILE'
  dept: 'ARGE' | 'URGE' | 'GKK' | 'PK' | 'FQM' | 'SSH'
  userGroups: UserGroups[]
}): Promise<User> => {
  'use server'

  try {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const userData: any = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      dept: data.dept
    }

    if (data.userGroups && data.userGroups.length > 0) {
      userData.userGroups = {
        connect: data.userGroups.map((group) => ({ id: group.id }))
      }
    }

    const user = await db.user.create({
      data: userData,
      include: {
        userGroups: true
      }
    })

    return user as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw new Error('Failed to create user')
  }
}

export async function getRoleAndDepartmentValues() {
  const { UserRole, Departments } = await import('@prisma/client')

  const roles = Object.values(UserRole)
  const departments = Object.values(Departments)

  return {
    roles,
    departments
  }
}
