'use server'

import { db } from '@/lib/db'
import { FormStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

interface Model {
  id?: string
  name: string
  status: FormStatus
  image: string
  groupsId: string
}

// create
export const createModel = async ({
  id,
  name,
  status,
  image,
  groupsId
}: Model): Promise<any> => {
  try {
    const existingModel = await getModelByName(name)

    if (id) {
      return await db.models.update({
        where: { id },
        data: { name, status, image, groupsId }
      })
    }

    if (existingModel) {
      return new NextResponse('Model already exists', { status: 400 })
    } else {
      return await db.models.create({
        data: {
          name,
          status,
          image: image || '',
          groupsId
        }
      })
    }
  } catch (error) {
    console.error('Error creating model:', error)
    return new NextResponse('Failed to create model', { status: 500 })
  }
}
export const getModelByName = async (name: string) => {
  return await db.models.findUnique({
    where: { name }
  })
}

export const deleteModel = async (id: string) => {
  try {
    await db.models.delete({ where: { id } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle model', { status: 500 })
  }
}

export const getModelById = async (id: string) => {
  try {
    return await db.models.findUnique({
      where: { id },
      include: { groups: true }
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getModels = async () => {
  try {
    const models = await db.models.findMany({
      include: { groups: true },
      orderBy: { createdAt: 'desc' }
    })

    const formattedModels = models.map((item) => ({
      id: item.id,
      name: item.name,
      groupId: item.groupsId,
      group: item.groups.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedModels
  } catch (error) {
    console.error(error)
    return null
  }
}
