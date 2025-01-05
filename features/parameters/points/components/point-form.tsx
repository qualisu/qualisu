'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FormStatus, Groups, Points } from '@prisma/client'
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
import { AlertModal } from '@/components/alert-modal'
import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import {
  createPoint,
  deletePoint
} from '@/features/parameters/points/api/server-actions'
import { MultiSelect } from '@/components/multi-select'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'

interface Props {
  id?: string
  groups: GroupsColumn[]
  initialData: PointsColumn
}

export const pointSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be atleast 3 characters long.' }),
  status: z.enum([FormStatus.Active, FormStatus.Passive]),
  groups: z.array(
    z.string().min(1, { message: 'Please select at least one group.' })
  )
})

export default function PointForm({ id, initialData, groups }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialData?.groups.map((group) => group.id)
  )

  const form = useForm<z.infer<typeof pointSchema>>({
    resolver: zodResolver(pointSchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name,
      status: initialData?.status,
      groups: initialData?.groups.map((group) => group.id) ?? []
    }
  })

  const onSubmit = async (values: z.infer<typeof pointSchema>) => {
    try {
      await createPoint(values)
      toast({
        variant: 'success',
        title: '🎉 Point created',
        description: 'Point created successfully'
      })
      router.push('/parameters/points')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Point did not save!'
      })
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deletePoint(id)
      toast({
        variant: 'success',
        title: '🎉 Point deleted',
        description: 'Point deleted successfully'
      })
      router.refresh()
      router.push('/parameters/points')
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
            title="Create Points"
            description="What would you like to name your points?"
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
              name="groups"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Groups</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={groups.map((group) => ({
                        value: group.id,
                        label: group.name
                      }))}
                      onValueChange={(value) => {
                        form.setValue('groups', selectedGroups)
                        field.onChange(value)
                      }}
                      defaultValue={field.value}
                      maxCount={2}
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
