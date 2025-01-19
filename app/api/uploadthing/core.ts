import { auth } from '@/auth'
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

const handleAuth = async () => {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return { userId: session.user.id }
}

export const ourFileRouter = {
  vehicleModelImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  vehicleImage: f({ image: { maxFileSize: '8MB', maxFileCount: 3 } })
    .middleware(handleAuth)
    .onUploadComplete(() => {}),
  answerImage: f({ image: { maxFileSize: '8MB', maxFileCount: 3 } })
    .middleware(handleAuth)
    .onUploadComplete(() => {})
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
