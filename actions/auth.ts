import { auth } from '@/auth'
import { User, UserGroups, Points } from '@prisma/client'
import { db } from '@/lib/db'

export async function getCurrentUser() {
  try {
    const session = await auth()

    if (!session?.user) {
      return null
    }

    return session.user
  } catch (error) {
    return null
  }
}

export const getUser = async (): Promise<
  (User & { userGroups: (UserGroups & { points: Points[] })[] }) | null
> => {
  const session = await getCurrentUser()
  if (!session) return null

  return db.user.findUnique({
    where: { id: session.id },
    include: { userGroups: { include: { points: true } } }
  })
}
