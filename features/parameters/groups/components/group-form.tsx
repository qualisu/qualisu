'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { FormStatus } from '@prisma/client'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { useRouter } from 'next/navigation'
import Heading from '@/components/heading'
import { Group, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createVehicleGroup, deleteVehicleGroup } from '../api/server-actions'
import { AlertModal } from '@/components/alert-modal'

interface Props {
  id?: string | undefined
  defaultValues?: FormValues
  disabled?: boolean
}

export const formSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  status: z.enum([FormStatus.Active, FormStatus.Passive])
})

export type FormValues = z.infer<typeof formSchema>

export const VehicleGroupForm = ({ defaultValues, id }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createVehicleGroup(values)
      toast({
        variant: 'success',
        title: '🎉 Vehicle group created',
        description: 'Vehicle group created successfully'
      })
      router.push('/parameters/groups')
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
      await deleteVehicleGroup(id)
      router.refresh()
      router.push('/parameters/groups')
      toast({
        variant: 'success',
        title: '🎉 Vehicle group deleted',
        description: 'Vehicle group deleted successfully'
      })
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
            title="Create Vehicle Group"
            description="What would you like to name your vehicle group?"
            icon={<Group />}
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
                onClick={() => router.push('/parameters/groups')}
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
