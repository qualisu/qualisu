'use server'

import { db } from '@/lib/db'
import { UserGroups, Points, cTypes } from '@prisma/client'
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
        types: values.types?.map((type) => type as cTypes) || [],
        points: values.points?.length
          ? { connect: values.points.map((id) => ({ id })) }
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
        points: { set: values.points?.map((id) => ({ id })) || [] },
        types: values.types?.map((type) => type as cTypes) || []
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
  (UserGroups & { points: Points[]; types: cTypes[] })[]
> => {
  try {
    const userGroups = await db.userGroups.findMany({
      include: { points: true },
      orderBy: { name: 'asc' }
    })

    return userGroups
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to fetch user groups')
  }
}
