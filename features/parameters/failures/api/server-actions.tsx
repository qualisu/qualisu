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

export const getFailureById = async (code: string) => {
  const res = await db.failures.findUnique({
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
    const res = await db.failures.findMany({
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
    console.error(error)
    return new NextResponse('Failed to fetch failures', { status: 500 })
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
      return await db.failures.update({
        where: { code },
        data: { code, descEng, descTurk, status }
      })
    } else {
      if (existingFailure) {
        return new NextResponse('Failure already exists', { status: 400 })
      } else {
        return await db.failures.create({
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
    await db.failures.delete({
      where: { code }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failure', { status: 500 })
  }
}

export const deleteFailures = async (codes: string[]) => {
  try {
    await db.failures.deleteMany({
      where: { code: { in: codes } }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete failures', { status: 500 })
  }
}
