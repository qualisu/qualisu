'use server'

import { db } from '@/lib/db'
import { format } from 'date-fns'
import { FormStatus } from '@prisma/client'
import { NextResponse } from 'next/server'

import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'

interface Dealers {
  id?: string
  name: string
  country: string
  city: string
  code: string
  status: FormStatus
}

export const getDealers = async () => {
  try {
    const res = await db.dealers.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const formattedData: DealersColumn[] = res.map((item) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      country: item.country,
      state: item.state ?? '',
      city: item.city ?? '',
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch categories', { status: 500 })
  }
}

export const createDealer = async ({
  id,
  name,
  code,
  country,
  state,
  city,
  status
}: DealersColumn): Promise<any> => {
  try {
    const existingDealer = await getDealerByCode(code)

    if (id) {
      return await db.dealers.update({
        where: { id },
        data: { code, name, country, state, city, status }
      })
    } else {
      if (existingDealer) {
        return new NextResponse('Failure already exists', { status: 400 })
      } else {
        return await db.dealers.create({
          data: { code, name, country, state, city, status }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteDealer = async (id: string) => {
  try {
    const res = await db.dealers.delete({
      where: { id }
    })

    return res
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete dealer', { status: 500 })
  }
}

export const getDealerByCode = async (code: string) => {
  return await db.dealers.findUnique({
    where: { code }
  })
}

export const getDealerById = async (id: string) => {
  try {
    const res = await db.dealers.findUnique({
      where: { id }
    })

    const formattedData = {
      id: res?.id,
      name: res?.name,
      code: res?.code,
      country: res?.country,
      state: res?.state,
      city: res?.city,
      status: res?.status,
      createdAt: format(res?.createdAt ?? new Date(), 'dd-MM-yyyy'),
      updatedAt: format(res?.updatedAt ?? new Date(), 'dd-MM-yyyy')
    }

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch dealer', { status: 500 })
  }
}
