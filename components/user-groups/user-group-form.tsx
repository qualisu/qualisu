'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Points, ChecklistTypes } from '@prisma/client'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/multi-select'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  points: z.array(z.string()).optional(),
  types: z.array(z.string()).optional()
})

export type UserGroupFormData = z.infer<typeof formSchema>

interface UserGroupFormProps {
  defaultValues: UserGroupFormData
  onSubmit: (data: UserGroupFormData) => void
  onCancel: () => void
  points: Points[]
  types: ChecklistTypes[]
  isEdit: boolean
  loading: boolean
}

export const UserGroupForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  points,
  types,
  isEdit,
  loading
}: UserGroupFormProps) => {
  const form = useForm<UserGroupFormData>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={loading}
                  placeholder="Enter user group name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <MultiSelect
                  className="w-full col-span-3"
                  options={points.map((point) => ({
                    value: point.id,
                    label: point.name
                  }))}
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('points', value, {
                      shouldValidate: true
                    })
                  }}
                  defaultValue={field.value}
                  placeholder="Select points"
                  variant={'secondary' as const}
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="types"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Types</FormLabel>
              <FormControl>
                <MultiSelect
                  className="w-full col-span-3"
                  options={types.map((type) => ({
                    value: type.id,
                    label: type.name
                  }))}
                  onValueChange={(value) => {
                    field.onChange(value)
                    form.setValue('types', value, {
                      shouldValidate: true
                    })
                  }}
                  defaultValue={field.value}
                  placeholder="Select types"
                  variant={'secondary' as const}
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
