'use server'

import { FailuresColumn } from '@/app/(qualisu)/parameters/failures/columns'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

export const getFailureByCode = async (code: string) => {
  return await db.failureCodes.findUnique({
    where: { code }
  })
}

export const getFailureById = async (code: string) => {
  const res = await db.failureCodes.findUnique({
    where: { code }
  })

  const formattedData = {
    code: res?.code,
    descEng: res?.descEng,
    descTurk: res?.descTurk,
    status: res?.status
  }

  return formattedData
}

export const getFailures = async () => {
  try {
    const res = await db.failureCodes.findMany({
      orderBy: { code: 'asc' }
    })

    const formattedData: FailuresColumn[] = res.map((item) => ({
      code: item.code,
      descEng: item.descEng,
      descTurk: item.descTurk,
      status: item.status
    }))

    return formattedData
  } catch (error) {
    console.error('Error fetching failures:', error)
    return [] // Return empty array instead of NextResponse
  }
}

export const createFailure = async ({
  code,
  descEng,
  descTurk,
  status
}: FailuresColumn): Promise<any> => {
  try {
    const existingFailure = await getFailureByCode(code)

    if (code) {
      return await db.failureCodes.update({
        where: { code },
        data: { code, descEng, descTurk, status }
      })
    } else {
      if (existingFailure) {
        return new NextResponse('Failure already exists', { status: 400 })
      } else {
        return await db.failureCodes.create({
          data: { code, descEng, descTurk, status }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteFailure = async (code: string) => {
  try {
    await db.failureCodes.delete({
      where: { code }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failure', { status: 500 })
  }
}

export const deleteFailures = async (codes: string[]) => {
  try {
    await db.failureCodes.deleteMany({
      where: { code: { in: codes } }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failures', { status: 500 })
  }
}
