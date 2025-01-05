'use client'

import { ourFileRouter } from '@/app/api/uploadthing/core'
import { UploadDropzone } from './uploadthing'
import { useToast } from './ui/use-toast'

interface FileUploadProps {
  onChange: (base64: string) => void
  endpoint: keyof typeof ourFileRouter
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  const { toast } = useToast()

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res[0].url)
        toast({
          title: '🚀 Image uploaded successfully!',
          description: 'Your image has been uploaded to the server.'
        })
      }}
      onUploadError={(error: Error) => {
        toast({
          variant: 'destructive',
          title: '🚨 Something was wrong!',
          description: `ERROR! ${error.message}`
        })
      }}
    />
  )
}
