'use server'

import { FailuresColumn } from '@/app/(qualisu)/parameters/failures/columns'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

export const getFailureByCode = async (code: string) => {
  return await db.failures.findUnique({
    where: { code }
  })
}

export const getFailureById = async (id: string) => {
  const res = await db.failures.findUnique({
    where: { id }
  })

  const formattedData = {
    id: res?.id,
    code: res?.code,
    name: res?.name,
    status: res?.status,
    createdAt: format(res?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(res?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const getFailures = async () => {
  try {
    const res = await db.failures.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const formattedData: FailuresColumn[] = res.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch failures', { status: 500 })
  }
}

export const createFailure = async ({
  code,
  name,
  status,
  id
}: FailuresColumn): Promise<any> => {
  try {
    const existingFailure = await getFailureByCode(code)

    if (id) {
      return await db.failures.update({
        where: { id },
        data: { code, name, status }
      })
    } else {
      if (existingFailure) {
        return new NextResponse('Failure already exists', { status: 400 })
      } else {
        return await db.failures.create({
          data: { code, name, status }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteFailure = async (id: string) => {
  try {
    await db.failures.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failure', { status: 500 })
  }
}

export const deleteFailures = async (ids: string[]) => {
  try {
    await db.failures.deleteMany({
      where: { id: { in: ids } }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failures', { status: 500 })
  }
}
