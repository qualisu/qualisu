'use server'

import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import { db } from '@/lib/db'
import { FormStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

interface VehicleGroup {
  id?: string
  name: string
  status: FormStatus
}

export const getVehicleGroupByName = async (name: string) => {
  return await db.vehicleGroup.findUnique({
    where: { name }
  })
}

export const getVehicleGroupById = async (id: string) => {
  const res = await db.vehicleGroup.findUnique({
    where: { id }
  })

  const formattedData = {
    id: res?.id,
    name: res?.name,
    status: res?.status,
    createdAt: format(res?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(res?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const getGroups = async () => {
  try {
    const res = await db.vehicleGroup.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const formattedData: GroupsColumn[] = res.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return null
  }
}

export const createVehicleGroup = async ({
  name,
  status,
  id
}: VehicleGroup): Promise<any> => {
  try {
    const existingVehicleGroup = await getVehicleGroupByName(name)

    if (id) {
      return await db.vehicleGroup.update({
        where: { id },
        data: { name, status }
      })
    } else {
      if (existingVehicleGroup) {
        return new NextResponse('Vehicle group already exists', { status: 400 })
      } else {
        return await db.vehicleGroup.create({
          data: { name, status, id }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteVehicleGroup = async (id: string) => {
  try {
    await db.vehicleGroup.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle group', { status: 500 })
  }
}

export const deleteVehicleGroups = async (ids: string[]) => {
  try {
    await db.vehicleGroup.deleteMany({
      where: { id: { in: ids } }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle groups', { status: 500 })
  }
}
