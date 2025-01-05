'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
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
import { BadgeAlert, Group, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import { useState } from 'react'
import {
  createCategory,
  deleteCategory
} from '@/features/parameters/categories/api/server-actions'
import { CategoriesColumn } from '@/app/(qualisu)/parameters/categories/category-columns'

interface Props {
  id?: string
  initialData: CategoriesColumn
}

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  status: z.enum([FormStatus.Active, FormStatus.Passive])
})

export type FormValues = z.infer<typeof categorySchema>

export default function CategoryForm({ id, initialData }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createCategory(values as any)
      toast({
        variant: 'success',
        title: '🎉 Category created',
        description: 'Category created successfully'
      })
      router.push('/parameters/categories')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Category did not save!'
      })
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteCategory(id)
      toast({
        variant: 'success',
        title: '🎉 Category deleted',
        description: 'Category deleted successfully'
      })
      router.refresh()
      router.push('/parameters/categories')
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
            title={id ? 'Edit Category' : 'Create Category'}
            description={
              id
                ? 'Edit your category'
                : 'What would you like to name your category?'
            }
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
                      placeholder="e.g. Kapi Kontrolleri"
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
                onClick={() => router.push('/parameters/categories')}
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
