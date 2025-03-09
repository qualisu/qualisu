import { auth } from '@/auth'
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

const handleAuth = async () => {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  return { userId: session.user.id }
}

// Normalize file name by removing special characters and spaces
const normalizeFileName = (fileName: string): string => {
  const name = fileName.split('.')[0]
  const ext = fileName.split('.').pop()

  // Replace Turkish characters and spaces
  const normalized = name
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove any other special characters

  return `${normalized}.${ext}`
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
    .onUploadComplete(async ({ file }) => {
      // Normalize the file name
      const normalizedFileName = normalizeFileName(file.name)
      return { normalizedFileName }
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
