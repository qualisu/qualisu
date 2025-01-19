'use server'

import { db } from '@/lib/db'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'
import { FormStatus, Points, Groups } from '@prisma/client'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'

type PointWithGroups = Points & {
  groups: Groups[]
  createdAt: string
  updatedAt: string
}

interface CreatePointInput {
  id?: string
  name: string
  status: FormStatus
  groups: string[]
}

export const createPoint = async ({
  id,
  name,
  status,
  groups
}: CreatePointInput): Promise<Points | NextResponse> => {
  try {
    const existingPoint = await getPointByName(name)

    if (id) {
      await db.points.update({
        where: { id },
        data: { groups: { set: [] } }
      })

      return await db.points.update({
        where: { id },
        data: {
          name,
          status,
          id,
          groups: {
            connect: groups.map((group) => ({ id: group }))
          }
        }
      })
    }

    if (existingPoint) {
      return new NextResponse('Point already exists', { status: 400 })
    } else {
      return await db.points.create({
        data: {
          name,
          status,
          groups: {
            connect: groups.map((group) => ({ id: group }))
          }
        }
      })
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const getPointByName = async (name: string) => {
  return await db.points.findUnique({
    where: { name }
  })
}

export const deletePoint = async (id: string) => {
  try {
    await db.points.delete({ where: { id } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete point', { status: 500 })
  }
}

export const getPointById = async (id: string) => {
  try {
    const point = await db.points.findUnique({
      where: { id },
      include: { groups: true }
    })

    if (!point) {
      return null
    }

    const formattedData: PointsColumn = {
      id: point?.id,
      name: point?.name,
      status: point?.status,
      groups: point?.groups,
      createdAt: new Date(point?.createdAt ?? new Date()),
      updatedAt: new Date(point?.updatedAt ?? new Date())
    }

    return formattedData
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getPoints = async (
  userGroupId?: string
): Promise<PointWithGroups[]> => {
  try {
    const points = await db.points.findMany({
      where: {
        status: 'Active',
        ...(userGroupId && {
          groups: { some: { id: userGroupId } }
        })
      },
      include: { groups: true }
    })

    const formattedPoints = points.map((point) => ({
      ...point,
      createdAt: format(point.createdAt ?? new Date(), 'dd/MM/yyyy'),
      updatedAt: format(point.updatedAt ?? new Date(), 'dd/MM/yyyy')
    }))

    return formattedPoints as PointWithGroups[]
  } catch (error) {
    console.error('Error fetching points:', error)
    return []
  }
}
