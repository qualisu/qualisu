'use client'

import axios from 'axios'
import Image from 'next/image'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useState } from 'react'
import { BadgeAlert, Loader2, Trash, XCircle } from 'lucide-react'
import { ChecklistTypes, FormStatus, Tags } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import Heading from '@/components/heading'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import {
  createQuestion,
  createTag,
  deleteQuestion
} from '../api/server-actions'
import { QuestionsColumn } from '@/app/(qualisu)/checklists/questions/questions-columns'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/multi-select'
import { Grades } from '@/lib/data'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'
import { UploadDropzone } from '@/components/uploadthing'
import CreatableSelect from 'react-select/creatable'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  id?: string
  initialData: QuestionsColumn
  checklistTypes: ChecklistTypes[]
  subCategories: SubCategoriesColumn[]
  tags: Tags[]
}

export const questionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  grade: z.string().min(1),
  subCategoriesId: z.string().min(1),
  checklistTypes: z.array(z.string()),
  images: z.array(z.string()),
  tags: z.array(z.string()),
  status: z.enum([FormStatus.Active, FormStatus.Passive])
})

export type FormValues = z.infer<typeof questionSchema>

export default function QuestionForm({
  id,
  checklistTypes,
  subCategories,
  initialData,
  tags
}: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [imageDeleting, setImageDeleting] = useState(false)
  const [selectedType, setSelectedType] = useState<string[]>(
    initialData?.checklistTypes?.map((type) => type.id)
  )
  const [updatedTags, setUpdatedTags] = useState<Tags[]>(tags)
  const [defaultTags, setDefaultTags] = useState<Tags[]>(
    initialData?.tags?.map((tag) => ({ id: tag.id, name: tag.name })) ?? []
  )

  useEffect(() => {
    setUpdatedTags(tags)
  }, [tags])

  const addNewTag = (newTag: any) => {
    setUpdatedTags((prevTags) => [...prevTags, newTag])
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: initialData.id,
      name: initialData.name,
      description: initialData.description,
      grade: initialData.grade,
      images: initialData.images,
      status: initialData.status,
      subCategoriesId: initialData.subCategoriesId,
      tags: initialData?.tags?.map((tag) => tag.id) ?? [],
      checklistTypes: initialData?.checklistTypes?.map((type) => type.id) ?? []
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createQuestion(values)
      toast({
        variant: 'success',
        title: '🎉 Failure created',
        description: 'Failure created successfully'
      })
      router.push('/checklists/questions')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Vehicle group did not save!'
      })
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteQuestion(id)
      toast({
        variant: 'success',
        title: '🎉 Failure deleted',
        description: 'Failure deleted successfully'
      })
      router.refresh()
      router.push('/checklists/questions')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Error',
        description: 'Something went wrong'
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleDeleteImage = (image: string, index: number) => {
    setImageDeleting(true)
    const imageKey = image.substring(image.lastIndexOf('/') + 1)
    axios
      .post('/api/uploadthing/delete', { imageKey })
      .then((res) => {
        if (res.data.success) {
          setImages(images.filter((_, i) => i !== index))
          form.setValue(
            'images',
            images.filter((_, i) => i !== index)
          )
          toast({
            variant: 'success',
            title: '🎉 Vehicle model image deleted',
            description: 'Vehicle model image deleted successfully'
          })
        }
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: '🚨 Something was wrong!',
          description: 'Vehicle model image did not delete!'
        })
      })
      .finally(() => {
        setImageDeleting(false)
      })
  }

  const { isSubmitting, isValid } = form.formState

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isSubmitting}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading
            title="Create Questions"
            description="Please create question for checklists."
            icon={<BadgeAlert />}
          />
          {id && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setOpen(true)}
            >
              <Trash className="size-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. Otobus, Midibus, Kamyon"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="e.g. 123456"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="checklistTypes"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Checklist Types</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={checklistTypes.map((checklistType) => ({
                        value: checklistType.id,
                        label: checklistType.name
                      }))}
                      onValueChange={(value) => {
                        form.setValue('checklistTypes', selectedType)
                        field.onChange(value)
                      }}
                      defaultValue={field.value}
                      maxCount={2}
                      className="rounded-none border border-input bg-white text-sm ring-offset-background"
                      variant="secondary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="subCategoriesId"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategories.map((subCategories) => (
                          <SelectItem
                            key={subCategories.id}
                            value={subCategories.id}
                          >
                            {subCategories.category} - {subCategories.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="grade"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="images"
              control={form.control}
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 gap-4">
                  <FormLabel>Question Image(s)</FormLabel>
                  <FormControl>
                    <div>
                      {images.length > 0 ? (
                        <>
                          <div className="mb-4 flex items-center gap-4">
                            <div className="flex space-x-2">
                              {images.map((image, index) => (
                                <div
                                  key={index}
                                  className="flex relative border-2 border-gray-100 rounded-md p-1"
                                >
                                  <div className="z-10 absolute top-2 right-2">
                                    <Button
                                      className="absolute top-0 right-0"
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteImage(image, index)
                                      }
                                    >
                                      {imageDeleting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <Trash className="size-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <Image
                                    key={index}
                                    width={200}
                                    height={200}
                                    src={image}
                                    alt="Vehicle model image"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <UploadDropzone
                            endpoint="vehicleImage"
                            onClientUploadComplete={(res) => {
                              setImages(res.map((item) => item.url))
                              field.onChange(res.map((item) => item.url))
                              toast({
                                title: '🚀 Image uploaded successfully!',
                                description:
                                  'Your image has been uploaded to the server.'
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
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start">
                  <FormLabel className="text-left">Tags</FormLabel>
                  <FormControl>
                    <CreatableSelect
                      onChange={(tags) => {
                        const newTags = tags ? tags.map((tag) => tag.value) : []
                        form.setValue('tags', newTags)
                      }}
                      isMulti
                      defaultValue={defaultTags.map((tag) => ({
                        value: tag.id,
                        label: tag.name
                      }))}
                      options={updatedTags.map((tag) => ({
                        value: tag.id,
                        label: tag.name
                      }))}
                      onCreateOption={async (input) => {
                        const newTag = {
                          id: uuidv4(),
                          name: input
                        }
                        await createTag(newTag)
                        addNewTag(newTag)
                        form.setValue('tags', [...field.value, newTag.id])
                      }}
                      className="text-sm h-10"
                      components={{
                        MultiValue: (props: any) => {
                          const [isAnimating, setIsAnimating] = useState(false)
                          return (
                            <Badge
                              className={cn(
                                'bg-muted text-gray-700 font-bold px-2 py-0.5 rounded-md m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300 hover:bg-muted',
                                isAnimating ? 'animate-bounce' : ''
                              )}
                              style={{
                                animationDuration: isAnimating ? '1s' : '0s'
                              }}
                              onClick={() => setIsAnimating(!isAnimating)}
                            >
                              {props.data.label}
                              <div
                                className="ml-2 bg-gray-200 rounded-full p-0.5 hover:bg-gray-300"
                                {...props.removeProps}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  props.removeProps.onClick(e)
                                }}
                              >
                                <XCircle className="h-4 w-4 cursor-pointer" />
                              </div>
                            </Badge>
                          )
                        }
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '36px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          boxShadow: 'none',
                          '&:hover': {
                            borderColor: '#e5e7eb'
                          }
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: '0 8px',
                          gap: '4px'
                        }),
                        input: (base) => ({
                          ...base,
                          margin: '0',
                          padding: '0'
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#6b7280'
                        }),
                        menu: (base) => ({
                          ...base,
                          borderRadius: '4px',
                          marginTop: '0',
                          backgroundColor: 'white'
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? '#f3f4f6'
                            : 'white',
                          color: '#374151',
                          ':active': {
                            backgroundColor: '#f3f4f6'
                          }
                        })
                      }}
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 4,
                        colors: {
                          ...theme.colors,
                          primary: '#f3f4f6',
                          primary25: '#f3f4f6',
                          neutral0: 'white',
                          neutral5: '#f3f4f6',
                          neutral10: '#e5e7eb',
                          neutral20: '#e5e7eb',
                          neutral30: '#d1d5db',
                          neutral40: '#9ca3af',
                          neutral50: '#6b7280',
                          neutral60: '#4b5563',
                          neutral70: '#374151',
                          neutral80: '#1f2937',
                          neutral90: '#111827'
                        }
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="status"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={FormStatus.Active}>
                          Active
                        </SelectItem>
                        <SelectItem value={FormStatus.Passive}>
                          Passive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => router.push('/checklists/questions')}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
