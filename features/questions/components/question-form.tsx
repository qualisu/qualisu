'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

import {
  ChecklistTypes,
  QuestionGrade,
  AnswerType,
  QuestionCatalog,
  Tags
} from '@prisma/client'

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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import Heading from '@/components/heading'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'
import { createQuestion } from '../api/server-actions'
import { TagsInput } from '@/components/tags'

const questionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  desc: z.string(),
  type: z.enum(Object.values(ChecklistTypes) as [string, ...string[]]),
  grade: z.enum(Object.values(QuestionGrade) as [string, ...string[]]),
  answerType: z
    .enum(Object.values(AnswerType) as [string, ...string[]])
    .optional(),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
  value: z.string().optional(),
  subCategoryId: z.string(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      failureSubCategoryId: z.string().optional()
    })
  ),
  images: z.array(z.string()),
  docs: z.array(z.string()),
  version: z.number(),
  isLatest: z.boolean(),
  prevId: z.string().optional(),
  prev: z.any().optional(),
  next: z.any().optional()
})

type FormValues = z.infer<typeof questionSchema>

interface TagWithCategory extends Tags {
  category?: Array<{ id: string; name: string }>
}

interface QuestionFormProps {
  onBack?: () => void
  selectedOption?: string
  questionTypes: string[]
  subCategories: SubCategoriesColumn[]
  question?: QuestionCatalog
  mode?: 'create' | 'edit'
  uploadedFiles: { images: string[]; docs: string[] }
  tags: TagWithCategory[]
}

export default function QuestionForm({
  onBack,
  question,
  mode = 'create',
  questionTypes = [],
  subCategories = [],
  uploadedFiles,
  tags
}: QuestionFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [filteredTags, setFilteredTags] = useState(tags)

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: '',
      type: questionTypes[0],
      name: '',
      desc: '',
      answerType: undefined,
      min: undefined,
      max: undefined,
      value: undefined,
      subCategoryId: '',
      tags: [],
      images: [],
      docs: [],
      version: 0,
      isLatest: true
    }
  })

  useEffect(() => {
    const subCategoryId = form.watch('subCategoryId')
    if (subCategoryId) {
      // Filter tags that belong to the selected subcategory
      // Use a type assertion to handle the category property
      const filtered = tags.filter((tag: any) => {
        // Check if tag has a category property and if it's an array
        return (
          tag.category &&
          Array.isArray(tag.category) &&
          tag.category.some((cat: any) => cat.id === subCategoryId)
        )
      })
      setFilteredTags(filtered)

      // Clear selected tags that don't belong to the new subcategory
      const currentSelectedTags = form.getValues('tags') || []
      if (currentSelectedTags.length > 0) {
        // Get IDs of valid tags for this subcategory
        const validTagIds = filtered.map((tag) => tag.id)

        // Filter out tags that don't belong to the new subcategory
        const validSelectedTags = currentSelectedTags.filter(
          (tag) => tag && validTagIds.includes(tag.id)
        )

        // If some tags were filtered out, update the form value
        if (validSelectedTags.length !== currentSelectedTags.length) {
          form.setValue('tags', validSelectedTags)
        }
      }
    } else {
      setFilteredTags(tags)
    }
  }, [form.watch('subCategoryId'), tags, form])

  // Check if answerType should be shown based on the selected type
  const shouldShowAnswerType = () => {
    const type = form.watch('type')
    return ['PERIODIC', 'PARTCOP', 'COP', 'TRACING'].includes(type)
  }

  // Check if min/max/value fields should be shown based on answerType
  const shouldShowMinMaxFields = () => {
    // First check if answerType should be shown
    if (!shouldShowAnswerType()) return false

    const answerType = form.watch('answerType')
    return answerType === 'MinMax' || answerType === 'Barcode'
  }

  // Check if value field should be shown
  const shouldShowValueField = () => {
    const answerType = form.watch('answerType')
    return answerType === 'MinMax' // Only show for MinMax, not for Barcode
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      console.log(values)

      // Only include answerType and related fields if they should be shown
      const formData = {
        ...values,
        id: values.id || `c${uuidv4().replace(/-/g, '').substring(0, 24)}`,
        // Only include answerType for specific question types
        answerType: shouldShowAnswerType() ? values.answerType : undefined,
        // Only include min/max if answerType is MinMax or Barcode
        min: shouldShowMinMaxFields() ? values.min : undefined,
        max: shouldShowMinMaxFields() ? values.max : undefined,
        // Only include value if answerType is MinMax
        value: shouldShowValueField() ? values.value : undefined
      }

      await createQuestion(formData as any)
      toast({
        variant: 'success',
        title: '🎉 Question created',
        description: 'Question created successfully'
      })
      router.push('/questions')
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        variant: 'destructive',
        title: '🚨 Something went wrong!',
        description:
          error instanceof Error
            ? error.message
            : 'Question could not be saved!'
      })
    } finally {
      setLoading(false)
    }
  }

  const { isSubmitting, isValid } = form.formState

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-4">
        <Heading
          title="Create Question"
          description="Add a new question to your checklist"
          icon={<HelpCircle />}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="version"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input
                        disabled={true}
                        type="number"
                        placeholder="Enter version"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.slice(0, 1).toUpperCase() +
                                type.slice(1).toLowerCase()}
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
                name="subCategoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isSubmitting}
                            className="w-full justify-between"
                          >
                            <span className="truncate text-left">
                              {field.value
                                ? `${
                                    subCategories?.find(
                                      (category) => category.id === field.value
                                    )?.name || ''
                                  } / ${
                                    subCategories?.find(
                                      (category) => category.id === field.value
                                    )?.mainCategory || 'Select category'
                                  }`
                                : 'Select category'}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] max-h-[300px] overflow-y-auto p-0">
                          <Command>
                            <CommandInput placeholder="Search by category or subcategory..." />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {subCategories?.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={`${category.name} ${
                                      category.mainCategory || ''
                                    }`}
                                    onSelect={() => {
                                      form.setValue(
                                        'subCategoryId',
                                        category.id
                                      )
                                      setOpen(false)
                                    }}
                                    className="flex items-center truncate"
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4 flex-shrink-0',
                                        category.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <span className="truncate">
                                      {category.name} / {category.mainCategory}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Enter question name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="desc"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Enter detailed description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="grade"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(QuestionGrade).map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {shouldShowAnswerType() && (
              <FormField
                name="answerType"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Answer Type</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select an answer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AnswerType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {shouldShowMinMaxFields() && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="min"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="Enter minimum value"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="max"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="Enter maximum value"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {shouldShowValueField() && (
                  <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="Enter value"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              name="tags"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiketler</FormLabel>
                  <FormControl>
                    <TagsInput
                      availableTags={filteredTags}
                      allTags={tags}
                      selectedTags={field.value
                        .map((tag) => tag?.id)
                        .filter(Boolean)}
                      onTagsChange={(selectedTags) => {
                        const selectedTagObjects = selectedTags
                          .map((tagId) => {
                            // First try to find in filtered tags (current subcategory)
                            let tagObject = filteredTags.find(
                              (t) => t.id === tagId
                            )

                            // If not found, look in all tags
                            if (!tagObject) {
                              tagObject = tags.find((t) => t.id === tagId)
                            }

                            return tagObject
                          })
                          .filter(Boolean)

                        field.onChange(selectedTagObjects)
                      }}
                      selectedSubCategoryId={form.watch('subCategoryId')}
                      subcategories={subCategories}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {mode === 'create' ? 'Create Question' : 'Update Question'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
