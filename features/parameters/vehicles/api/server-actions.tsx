'use server'

import { db } from '@/lib/db'
import { FormStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

interface Vehicle {
  id?: string
  name: string
  shortCode: string
  vinCode: string
  status: FormStatus
  images: string[]
  modelsId: string
}

// create
export const createVehicle = async ({
  id,
  name,
  shortCode,
  vinCode,
  status,
  images,
  modelsId
}: Vehicle): Promise<any> => {
  try {
    const existingVehicle = await getVehicleByName(name)

    if (id) {
      return await db.vehicles.update({
        where: { id },
        data: { name, status, id, images, modelsId, shortCode, vinCode }
      })
    }

    if (existingVehicle) {
      return new NextResponse('Vehicle already exists', { status: 400 })
    } else {
      return await db.vehicles.create({
        data: { name, status, id, images, modelsId, shortCode, vinCode }
      })
    }
  } catch (error) {
    return new NextResponse()
  }
}
export const getVehicleByName = async (name: string) => {
  return await db.vehicles.findUnique({
    where: { name }
  })
}

export const deleteVehicle = async (id: string) => {
  try {
    await db.vehicles.delete({ where: { id } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle', { status: 500 })
  }
}

export const getVehicleById = async (id: string) => {
  try {
    return await db.vehicles.findUnique({
      where: { id },
      include: { models: true }
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getVehicles = async () => {
  try {
    const vehicles = await db.vehicles.findMany({
      include: { models: { include: { groups: true } } },
      orderBy: { createdAt: 'desc' }
    })

    const formattedVehicles = vehicles.map((item) => ({
      id: item.id,
      name: item.name,
      shortCode: item.shortCode,
      vinCode: item.vinCode,
      modelId: item.modelsId,
      groupId: item.models.groupsId,
      images: item.images,
      model: item.models.name,
      group: item.models.groups.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedVehicles
  } catch (error) {
    console.error(error)
    return null
  }
}
