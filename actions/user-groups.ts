'use server'

import { db } from '@/lib/db'
import { UserGroups, Points, ChecklistTypes } from '@prisma/client'
import { revalidatePath } from 'next/cache'

interface UserGroupParams {
  name: string
  points?: string[]
  types?: string[]
}

export const createUserGroup = async (values: UserGroupParams) => {
  try {
    const userGroup = await db.userGroups.create({
      data: {
        name: values.name,
        points: values.points?.length
          ? { connect: values.points.map((id) => ({ id })) }
          : undefined,
        types: values.types?.length
          ? { connect: values.types.map((id) => ({ id })) }
          : undefined
      }
    })

    revalidatePath('/admin')
    return userGroup
  } catch (error) {
    throw new Error('Failed to create user group')
  }
}

export const updateUserGroup = async (id: string, values: UserGroupParams) => {
  try {
    const userGroup = await db.userGroups.update({
      where: { id },
      data: {
        name: values.name,
        points: {
          set: values.points?.map((id) => ({ id })) || []
        },
        types: {
          set: values.types?.map((id) => ({ id })) || []
        }
      }
    })

    revalidatePath('/admin')
    return userGroup
  } catch (error) {
    throw new Error('Failed to update user group')
  }
}

export const deleteUserGroup = async (id: string) => {
  try {
    await db.userGroups.delete({
      where: { id }
    })

    revalidatePath('/admin')
  } catch (error) {
    throw new Error('Failed to delete user group')
  }
}

export const getUserGroups = async (): Promise<
  (UserGroups & { points: Points[]; types: ChecklistTypes[] })[]
> => {
  try {
    const userGroups = await db.userGroups.findMany({
      include: {
        points: true,
        types: true
      },
      orderBy: { name: 'asc' }
    })

    return userGroups
  } catch (error) {
    throw new Error('Failed to fetch user groups')
  }
}
