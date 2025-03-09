'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { FormStatus } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
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
import { useRouter } from 'next/navigation'
import Heading from '@/components/heading'
import { Group, Loader2, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import { useState } from 'react'
import { FileUpload } from '@/components/file-upload'
import { createModel, deleteModel } from '../api/server-actions'
import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import { ModelsColumn } from '@/app/(qualisu)/parameters/models/columns'

interface Props {
  id?: string
  groups: GroupsColumn[]
  initialData: ModelsColumn
}

export const modelSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  status: z.enum([FormStatus.Active, FormStatus.Passive]),
  groupsId: z.string().min(1, { message: 'Vehicle group is required.' }),
  image: z.string().optional()
})

export const ModelForm = ({ id, initialData, groups }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, SetOpen] = useState(false)
  const [image, setImage] = useState<string | undefined>(initialData?.image)
  const [imageDeleting, setImageDeleting] = useState(false)
  const form = useForm<z.infer<typeof modelSchema>>({
    resolver: zodResolver(modelSchema),
    defaultValues: initialData
      ? { ...initialData }
      : { name: '', status: FormStatus.Active, groupsId: '', image: '' }
  })

  const onSubmit = async (values: z.infer<typeof modelSchema>) => {
    try {
      await createModel({ ...values, image: values.image || '' })
      toast({
        variant: 'success',
        title: '🎉 Vehicle model created',
        description: 'Vehicle model created successfully'
      })
      router.push('/parameters/models')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Vehicle model did not save!'
      })
    }
  }

  const handleDeleteImage = (image: string) => {
    setImageDeleting(true)
    const imageKey = image.substring(image.lastIndexOf('/') + 1)
    axios
      .post('/api/uploadthing/delete', { imageKey })
      .then((res) => {
        if (res.data.success) {
          setImage('')
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

  const handleDelete = async () => {
    if (!id) return
    await deleteModel(id)
    toast({
      variant: 'success',
      title: '🎉 Vehicle group deleted',
      description: 'Vehicle group deleted successfully'
    })
    router.push('/parameters/models')
  }

  const { isSubmitting, isValid } = form.formState

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => SetOpen(false)}
        onConfirm={handleDelete}
        loading={isSubmitting}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Heading
            title="Create Vehicle Model"
            description="What would you like to name your vehicle model?"
            icon={<Group />}
          />
          {id && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              onClick={() => SetOpen(true)}
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
              name="groupsId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Vehicle Group</FormLabel>
                  <FormDescription>
                    Select a vehicle group to assign to this vehicle model.
                  </FormDescription>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vehicle group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
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
            <FormField
              name="image"
              control={form.control}
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 gap-4">
                  <FormLabel>Upload an Image</FormLabel>
                  <FormDescription>
                    Choose a vehicle image to upload.
                  </FormDescription>
                  <FormControl>
                    <div>
                      {image ? (
                        <>
                          <div className="mb-4 flex items-center gap-4">
                            <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                              <div className="z-10 absolute top-2 right-2">
                                <Button
                                  className="absolute top-0 right-0"
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteImage(image)}
                                >
                                  {imageDeleting ? (
                                    <Loader2 className="size-4 animate-spin" />
                                  ) : (
                                    <Trash className="size-4" />
                                  )}
                                </Button>
                              </div>
                              <Image
                                src={image}
                                alt="Vehicle model image"
                                width={200}
                                height={200}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileUpload
                            onChange={(value) => {
                              setImage(value)
                              field.onChange(value)
                            }}
                            endpoint="vehicleModelImage"
                          />
                        </>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
                onClick={() => router.back()}
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
