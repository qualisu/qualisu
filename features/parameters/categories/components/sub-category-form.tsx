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
import { MultiSelect } from '@/components/multi-select'
import { FailuresColumn } from '@/app/(qualisu)/parameters/failures/columns'

interface Props {
  id?: string
  failureCodes: FailuresColumn[]
  categories: CategoriesColumn[]
  initialData: SubCategoriesColumn
}

export const subCategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Name must be atleast 3 characters long.' }),
  mainCategoryId: z.string().min(1, { message: 'Please select a category.' }),
  failureCodes: z.array(
    z.string().min(1, { message: 'Please select at least one failure.' })
  ),
  status: z.enum([FormStatus.Active, FormStatus.Passive])
})

export type FormValues = z.infer<typeof subCategorySchema>

export default function SubCategoryForm({
  id,
  initialData,
  failureCodes,
  categories
}: Props) {
  const safeFailures = failureCodes ?? []

  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name,
      status: initialData?.status,
      mainCategoryId: initialData?.mainCategoryId,
      failureCodes: initialData?.failureCodes?.map((fc) => fc.code) ?? []
    }
  })

  const onSubmit = async (values: FormValues) => {
    console.log(values)
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
      router.push('/parameters/failureCodes')
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
              name="mainCategoryId"
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
              name="failureCodes"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>failureCodes</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={safeFailures.map((failure) => ({
                        key: failure.code,
                        value: failure.code,
                        label: `${failure.code} - ${failure.descTurk}`,
                        searchText: `${failure.code} ${failure.descEng} ${failure.descTurk}`
                      }))}
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                      defaultValue={field.value}
                      maxCount={2}
                      searchable={(option, search) => {
                        const searchTerm = search.trim().toLowerCase()
                        if (searchTerm === '') return true

                        return (
                          option.value.toLowerCase().includes(searchTerm) ||
                          option.searchText.toLowerCase().includes(searchTerm)
                        )
                      }}
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
