'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'

import { ChecklistTypes, QuestionGrade } from '@prisma/client'

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

const questionSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  desc: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
  type: z.enum(Object.values(ChecklistTypes) as [string, ...string[]]),
  grade: z.enum(Object.values(QuestionGrade) as [string, ...string[]]),
  subCategoryId: z.string(),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  docs: z.array(z.string()),
  version: z.number(),
  isLatest: z.boolean(),
  prevId: z.string().optional(),
  prev: z.any().optional(),
  next: z.any().optional()
})

type FormValues = z.infer<typeof questionSchema>

interface QuestionFormProps {
  onBack?: () => void
  selectedOption?: string
  questionTypes: string[]
  subCategories: SubCategoriesColumn[]
}

export default function QuestionForm({
  onBack,
  questionTypes,
  subCategories
}: QuestionFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: questionTypes[0],
      name: '',
      desc: '',
      subCategoryId: '',
      tags: [],
      images: [],
      docs: [],
      version: 0,
      isLatest: true
    }
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      // TODO: Implement question creation API call
      console.log(values)

      toast({
        variant: 'success',
        title: '🎉 Question created',
        description: 'Question created successfully'
      })
      router.push('/questions')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something went wrong!',
        description: 'Question could not be saved!'
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
                    <FormLabel>Sub Category</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="h-10 justify-between w-full font-normal"
                          >
                            {field.value
                              ? subCategories.find(
                                  (sub) => sub.id === field.value
                                )?.mainCategory +
                                ' / ' +
                                subCategories.find(
                                  (sub) => sub.id === field.value
                                )?.name
                              : 'Select category...'}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search category..."
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-auto">
                            {subCategories.map((subCategory) => (
                              <CommandItem
                                key={subCategory.id}
                                value={subCategory.name}
                                onSelect={() => {
                                  field.onChange(subCategory.id)
                                  setOpen(false)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    field.value === subCategory.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                {subCategory.mainCategory} / {subCategory.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                Create Question
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
