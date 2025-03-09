'use client'

import { useState, useEffect } from 'react'
import {
  Checklists,
  Points,
  QuestionCatalog,
  VehicleGroup,
  VehicleModel
} from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { Check, FileText, Upload, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import ChecklistForm from './checklist-form'

interface ChecklistOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: string
}

interface ChecklistStepsProps {
  options: ChecklistOption[]
  selectedOption?: string
  onSelect: (id: string) => void
  currentStep?: number
  totalSteps?: number
  checklist?: Checklists
  points?: Points[]
  groups?: VehicleGroup[]
  models?: VehicleModel[]
  questions?: QuestionCatalog[]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ChecklistSteps({
  options,
  selectedOption,
  onSelect,
  currentStep = 1,
  totalSteps = 4,
  checklist,
  points,
  groups,
  models,
  questions
}: ChecklistStepsProps) {
  const [showForm, setShowForm] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{
    images: string[]
    docs: string[]
  }>({
    images: [],
    docs: []
  })
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const onUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'images' | 'docs'
  ) => {
    try {
      setUploading(true)
      const files = e.target.files
      if (!files?.length) return

      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds the 50MB size limit`)
        }

        const filePath = `images/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          })

        if (error) {
          console.error('Supabase upload error:', error)
          throw new Error(`Failed to upload ${file.name}: ${error.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.path)

        uploadedUrls.push(urlData.publicUrl)
      }

      setUploadedFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...uploadedUrls]
      }))
      toast({
        title: '✅ Success',
        description: 'Files uploaded successfully'
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: 'destructive',
        title: '🚨 Error',
        description:
          error instanceof Error ? error.message : 'Failed to upload files'
      })
    } finally {
      setUploading(false)
    }
  }

  if (showUpload) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex gap-1 mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full',
                index < 2 ? 'bg-indigo-500' : 'bg-secondary'
              )}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-medium">Images</h3>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => onUpload(e, 'images')}
                    className="cursor-pointer"
                  />
                  {uploadedFiles.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                              setUploadedFiles((prev) => ({
                                ...prev,
                                images: prev.images.filter(
                                  (_, i) => i !== index
                                )
                              }))
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-medium">Documents</h3>
                  </div>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    disabled={uploading}
                    onChange={(e) => onUpload(e, 'docs')}
                    className="cursor-pointer"
                  />
                  {uploadedFiles.docs.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.docs.map((doc, index) => (
                        <div key={index} className="relative group">
                          <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm truncate max-w-[150px]">
                              {doc.split('/').pop()}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setUploadedFiles((prev) => ({
                                  ...prev,
                                  docs: prev.docs.filter((_, i) => i !== index)
                                }))
                              }}
                              className="p-1 rounded-full hover:bg-destructive/90 hover:text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setShowUpload(false)
              }}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                setShowForm(true)
                setShowUpload(false)
              }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showForm) {
    const foundOption = options.find((opt) => opt.id === selectedOption)
    const selectedType = foundOption?.type

    return (
      <ChecklistForm
        questions={questions as any}
        mode={checklist ? 'edit' : 'create'}
        checklist={checklist as any}
        selectedOption={selectedType}
        checklistTypes={[selectedType!]}
        uploadedFiles={uploadedFiles}
        onBack={() => setShowUpload(true)}
        points={points as any}
        groups={groups as any}
        models={models as any}
      />
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="flex gap-1 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              index < currentStep ? 'bg-indigo-500' : 'bg-secondary'
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              'relative p-6 cursor-pointer hover:border-indigo-500 transition-colors',
              selectedOption === option.id
                ? 'border-2 border-indigo-500 bg-indigo-500/5'
                : 'border border-border'
            )}
            onClick={() => onSelect(option.id)}
          >
            {selectedOption === option.id && (
              <div className="absolute top-3 right-3">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium mb-1">{option.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowUpload(true)} disabled={!selectedOption}>
          Next
        </Button>
      </div>
    </div>
  )
}
