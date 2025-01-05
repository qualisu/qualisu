import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json()
    const { name, role, dept } = body

    if (!params.userId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    const user = await db.user.update({
      where: {
        id: params.userId
      },
      data: {
        name,
        role,
        dept
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USER_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
