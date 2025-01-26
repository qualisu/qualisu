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

export const createModel = async ({
  id,
  name,
  status,
  image,
  groupsId
}: Model): Promise<any> => {
  try {
    const existingModel = await getModelByName(name)
    const group = await db.vehicleGroup.findUnique({
      where: { id: groupsId }
    })

    if (!group) {
      return new NextResponse('Group not found', { status: 400 })
    }

    if (id) {
      return await db.vehicleModel.update({
        where: { id },
        data: { name, status, image, vehicleGroupId: group.id }
      })
    }

    if (existingModel) {
      return new NextResponse('Model already exists', { status: 400 })
    } else {
      return await db.vehicleModel.create({
        data: {
          name,
          status,
          image: image || '',
          vehicleGroupId: group.id
        }
      })
    }
  } catch (error) {
    console.error('Error creating model:', error)
    return new NextResponse('Failed to create model', { status: 500 })
  }
}

export const getModelByName = async (name: string) => {
  return await db.vehicleModel.findUnique({
    where: { name }
  })
}

export const getModelById = async (id: string) => {
  try {
    return await db.vehicleModel.findUnique({
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
    const res = await db.vehicleModel.findMany({
      include: { groups: true },
      orderBy: { createdAt: 'desc' }
    })

    const formattedRes = res.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      image: item.image,
      vehicleGroupId: item.vehicleGroupId,
      group: item.groups.name,
      createdAt: format(item.createdAt, 'dd/MM/yyyy'),
      updatedAt: format(item.updatedAt, 'dd/MM/yyyy')
    }))

    return formattedRes
  } catch (error) {
    console.error('Error fetching models:', error)
    return []
  }
}

export const deleteModel = async (id: string) => {
  try {
    await db.vehicleModel.delete({ where: { id } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle model', { status: 500 })
  }
}

export const deleteModels = async (ids: string[]) => {
  try {
    await db.vehicleModel.deleteMany({ where: { id: { in: ids } } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle models', { status: 500 })
  }
}
