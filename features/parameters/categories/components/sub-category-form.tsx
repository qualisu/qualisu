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
import { BadgeAlert, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import { useState } from 'react'
import {
  createSubCategory,
  deleteSubCategory
} from '@/features/parameters/categories/api/server-actions'
import { CategoriesColumn } from '@/app/(qualisu)/parameters/categories/category-columns'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'
import { FailuresColumn } from '@/app/(qualisu)/parameters/failures/columns'
import { MultiSelect } from '@/components/multi-select'

interface Props {
  id?: string
  failures: FailuresColumn[]
  categories: CategoriesColumn[]
  initialData: SubCategoriesColumn
}

export const subCategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
  failures: z.array(
    z.string().min(1, { message: 'Please select at least one failure.' })
  ),
  status: z.enum([FormStatus.Active, FormStatus.Passive])
})

export type FormValues = z.infer<typeof subCategorySchema>

export default function SubCategoryForm({
  id,
  initialData,
  failures,
  categories
}: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFailures, setSelectedFailures] = useState<string[]>(
    initialData?.failures?.map((failure) => failure.id)
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name,
      status: initialData?.status,
      categoryId: initialData?.categoryId,
      failures: initialData?.failures?.map((failure) => failure.id) ?? []
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createSubCategory(values as any)
      toast({
        variant: 'success',
        title: '🎉 Sub Category created',
        description: 'Sub Category created successfully'
      })
      router.push('/parameters/categories')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Sub Category did not save!'
      })
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteSubCategory(id)
      toast({
        variant: 'success',
        title: '🎉 Failure deleted',
        description: 'Failure deleted successfully'
      })
      router.refresh()
      router.push('/parameters/failures')
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
            title={id ? 'Edit Sub Category' : 'Create Sub Category'}
            description={
              id
                ? 'Edit your sub category'
                : 'What would you like to name your sub category?'
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
              name="categoryId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Category</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
              name="failures"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Failures</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={failures.map((failure) => ({
                        value: failure.id,
                        label: failure.name
                      }))}
                      onValueChange={(value) => {
                        form.setValue('failures', selectedFailures)
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
