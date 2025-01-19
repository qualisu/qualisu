'use server'

import { db } from '@/lib/db'
import { format } from 'date-fns'
import { revalidatePath } from 'next/cache'

export const getClaims = async () => {
  const claims = await db.claims.findMany({
    orderBy: { claimDate: 'desc' }
  })

  return claims
}

export async function createClaim(data: {
  claimNumber: string
  claimDate: Date
  dealerNo: string
  dealerName: string
  failureCode: string
  claimType: string
  vinNo: string
  km: number
  amount: number
  status: string
  budget: number
}) {
  try {
    const claim = await db.claims.create({
      data: { ...data }
    })

    revalidatePath('/claims')
    return { success: true, data: claim }
  } catch (error) {
    console.error('CLAIM_CREATE_ERROR', error)
    return { success: false, error: 'Failed to create claim.' }
  }
}
