'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export const getClaims = async () => {
  const claims = await db.claims.findMany({
    orderBy: { claimDate: 'desc' },
    include: {
      failures: true
    }
  })

  return claims
}

export async function createClaim(data: {
  claimNo: string
  claimDate: Date
  failureCode: string
  country: string
  dealerName: string
  vehicleGroup: string
  vehicleModel: string
  saseNo: string
  kilometre: number
  budgetNo: string
  amount: number
}) {
  try {
    const claim = await db.claims.create({
      data: data
    })

    revalidatePath('/claims')
    return { success: true, data: claim }
  } catch (error) {
    console.error('CLAIM_CREATE_ERROR', error)
    return { success: false, error: 'Failed to create claim.' }
  }
}
