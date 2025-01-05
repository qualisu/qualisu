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
import { createVehicle, deleteVehicle } from '../api/server-actions'
import { VehicleModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
import { VehiclesColumn } from '@/app/(qualisu)/parameters/vehicles/columns'
import { UploadDropzone } from '@/components/uploadthing'

interface Props {
  id?: string
  models: VehicleModelsColumn[]
  initialData: VehiclesColumn
  mode: 'create' | 'edit'
}

export const modelSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  status: z.enum([FormStatus.Active, FormStatus.Passive]),
  shortCode: z.string().min(1, { message: 'Short code is required.' }),
  vinCode: z.string().min(1, { message: 'VIN code is required.' }),
  modelsId: z.string().min(1, { message: 'Vehicle group is required.' }),
  images: z.array(z.string()).min(1, { message: 'Image is required.' })
})

export const VehicleForm = ({ id, initialData, models, mode }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, SetOpen] = useState(false)
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [imageDeleting, setImageDeleting] = useState(false)
  const form = useForm<z.infer<typeof modelSchema>>({
    resolver: zodResolver(modelSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          name: '',
          status: FormStatus.Active,
          modelsId: '',
          shortCode: '',
          vinCode: '',
          images: []
        }
  })

  const onSubmit = async (values: z.infer<typeof modelSchema>) => {
    try {
      await createVehicle(values)
      toast({
        variant: 'success',
        title: '🎉 Vehicle model created',
        description: 'Vehicle model created successfully'
      })
      router.push('/parameters/vehicles')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Vehicle model did not save!'
      })
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

  const handleDelete = async () => {
    if (!id) return
    await deleteVehicle(id)
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
            title={`${mode === 'create' ? 'Create' : 'Edit'} Vehicle`}
            description="What would you like to name your vehicle?"
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
              name="shortCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Code</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. OTO, MID, KAM"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="vinCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN Code</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 12345678901234567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="modelsId"
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
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.name}
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
              name="images"
              control={form.control}
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 gap-4">
                  <FormLabel>Upload Images</FormLabel>
                  <FormDescription>
                    Choose a vehicle image to upload.
                  </FormDescription>
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
                                    src={image}
                                    alt="Vehicle model image"
                                    width={200}
                                    height={200}
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
