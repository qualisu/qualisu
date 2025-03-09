'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { HelpCircle, Image, FileText } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ColumnDef } from '@tanstack/react-table'
import React from 'react'

import { cn } from '@/lib/utils'
import {
  Checklists,
  ChecklistTypes,
  FormStatus,
  Points,
  VehicleModel,
  VehicleGroup,
  QuestionCatalog,
  Vehicles,
  Dealers
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
import { Switch } from '@/components/ui/switch'
import { MultiSelect } from '@/components/multi-select'
import AddQuestionModal, { QuestionWithCategory } from './add-question-modal'
import { DataTable } from '@/components/data-table'
import {
  createChecklist,
  updateChecklist
} from '@/features/checklists/api/server-actions'
import { useCurrentUser } from '@/hooks/use-current-user'

const MemoizedDataTable = React.memo(DataTable) as typeof DataTable
const MemoizedAddQuestionModal = React.memo(AddQuestionModal)

const checklistSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  desc: z.string().optional(),
  type: z.enum(Object.values(ChecklistTypes) as [string, ...string[]]),
  userId: z.string().optional(),
  itemNo: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  modelIds: z.array(z.string()).optional(),
  questionIds: z.array(z.string()).optional(),
  dealerIds: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  pointIds: z.array(z.string()).optional(),
  docs: z.array(z.string()).optional(),
  status: z.enum(Object.values(FormStatus) as [string, ...string[]])
})

type FormValues = z.infer<typeof checklistSchema>

interface ChecklistFormProps {
  mode: 'create' | 'edit'
  checklist?: Checklists & {
    groups: VehicleGroup[]
    models: VehicleModel[]
    vehicles: Vehicles[]
    questions: Array<{
      questionId: string
      version: number
      question: QuestionCatalog
    }>
    dealers: Dealers[]
    points: Array<{ id: string; name: string; status: string }>
  }
  points: (Points & { groups: VehicleGroup[] })[]
  groups: VehicleGroup[]
  models: VehicleModel[]
  questions: (QuestionCatalog & {
    subCategory: { name: string; mainCategory: { name: string } }
  })[]
  onBack?: () => void
  selectedOption?: string
  checklistTypes: string[]
  uploadedFiles: { images: string[]; docs: string[] }
}

const selectedQuestionColumns: ColumnDef<
  QuestionCatalog & {
    subCategory: { name: string; mainCategory: { name: string } }
  }
>[] = [
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type
      return <p>{type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}</p>
    }
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'subCategoryName',
    header: 'Category',
    cell: ({ row }) => {
      const subCategory = row.original.subCategory
      return (
        <p className="px-4">
          {subCategory?.mainCategory.name} / {subCategory?.name}
        </p>
      )
    }
  }
]

export default function ChecklistForm({
  onBack,
  selectedOption,
  uploadedFiles,
  checklistTypes,
  checklist,
  points,
  groups,
  models,
  questions,
  mode = 'create'
}: ChecklistFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [filteredModels, setFilteredModels] = useState<typeof models>([])
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const user = useCurrentUser()

  // Memoize form options once
  const formOptions = useMemo(
    () => ({
      resolver: zodResolver(checklistSchema),
      defaultValues: {
        id: checklist?.id || '',
        type: (checklist?.type ||
          selectedOption ||
          checklistTypes[0]) as ChecklistTypes,
        name: checklist?.name || '',
        desc: checklist?.desc || '',
        userId: checklist?.userId || '',
        itemNo: checklist?.itemNo || [],
        groupIds:
          mode === 'edit'
            ? (checklist?.groups as any[])?.map((group) => group.id) || []
            : [],
        modelIds:
          mode === 'edit'
            ? (checklist?.models as any[])?.map((model) => model.id) || []
            : [],
        pointIds:
          mode === 'edit'
            ? (checklist?.points as any[])?.map((point) => point.id) || []
            : [],
        questionIds:
          mode === 'edit'
            ? (checklist?.questions as any[])?.map((q) => q.questionId) || []
            : [],
        dealerIds:
          mode === 'edit'
            ? (checklist?.dealers as any[])?.map((dealer) => dealer.id) || []
            : [],
        images:
          mode === 'edit'
            ? checklist?.images || []
            : uploadedFiles.images || [],
        docs:
          mode === 'edit' ? checklist?.docs || [] : uploadedFiles.docs || [],
        status: checklist?.status || FormStatus.Active
      }
    }),
    [checklist, mode, selectedOption, checklistTypes, uploadedFiles]
  )

  const form = useForm<FormValues>(formOptions)

  // Initialize form in edit mode - only run when checklist changes
  // useEffect(() => {
  //   if (mode === 'edit' && checklist) {
  //     const formValues = {
  //       id: checklist.id,
  //       type: checklist.type as ChecklistTypes,
  //       name: checklist.name,
  //       desc: checklist.desc || undefined,
  //       userId: checklist.userId || undefined,
  //       itemNo: checklist.itemNo || [],
  //       groupIds: (checklist.groups as any[])?.map((group) => group.id) || [],
  //       modelIds: (checklist.models as any[])?.map((model) => model.id) || [],
  //       pointIds: (checklist.points as any[])?.map((point) => point.id) || [],
  //       questionIds:
  //         (checklist.questions as any[])?.map((q) => q.questionId) || [],
  //       dealerIds: checklist.dealers || [],
  //       images: checklist.images || [],
  //       docs: checklist.docs || [],
  //       status: checklist.status
  //     }

  //     form.reset(formValues as any, { keepDefaultValues: true })
  //   }
  // }, [checklist, mode, form])

  // Watch form values outside component rendering to prevent infinite loops
  const selectedPointIds = form.watch('pointIds') || []
  const selectedGroupIds = form.watch('groupIds') || []
  const hasSelectedPoints = selectedPointIds.length > 0
  const hasSelectedGroups = selectedGroupIds.length > 0
  const watchedQuestionIds = form.watch('questionIds')
  const selectedType = form.watch('type') as ChecklistTypes
  const watchedImages = form.watch('images') || []
  const watchedDocs = form.watch('docs') || []

  // Memoized options
  const groupOptions = useMemo(() => {
    return groups
      ?.filter((group) => availableGroups.includes(group.id))
      .map((group) => ({
        value: group.id,
        label: group.name
      }))
  }, [groups, availableGroups])

  const modelOptions = useMemo(() => {
    return (
      filteredModels?.map((model) => ({
        value: model.id,
        label: model.name
      })) || []
    )
  }, [filteredModels])

  const pointOptions = useMemo(() => {
    return points?.map((point) => ({
      value: point.id,
      label: point.name
    }))
  }, [points])

  // Memoize the filtered questions computation
  const filteredQuestions = useMemo(() => {
    if (!questions) return []

    const selectedQuestionIds = watchedQuestionIds || []

    // Create a map of all questions from the catalog
    const questionsMap = new Map(questions.map((q) => [q.id, { ...q }]))

    // Convert map to array and filter only selected questions
    return Array.from(questionsMap.values()).filter((question) =>
      selectedQuestionIds.includes(question.id)
    )
  }, [questions, watchedQuestionIds])

  // Optimize onSubmit
  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!user?.id) {
        toast({
          variant: 'destructive',
          title: '🚨 Error',
          description: 'User not authenticated'
        })
        return
      }

      try {
        setLoading(true)

        // Create a map for faster lookups
        const checklistQuestionsMap = new Map(
          checklist?.questions?.map((q) => [q.questionId, q]) || []
        )
        const catalogQuestionsMap = new Map(questions.map((q) => [q.id, q]))

        const formattedQuestions = (values.questionIds || []).map((id) => ({
          id,
          version:
            checklistQuestionsMap.get(id)?.version ||
            catalogQuestionsMap.get(id)?.version ||
            1
        }))

        const payload = {
          ...values,
          userId: user.id,
          pointIds: values.pointIds || [],
          itemNo: values.itemNo || [],
          groupIds: values.groupIds || [],
          modelIds: values.modelIds || [],
          dealerIds: values.dealerIds || [],
          images: values.images || [],
          docs: values.docs || [],
          vehicleIds: [],
          questionIds: formattedQuestions
        }

        if (mode === 'create') {
          await createChecklist(payload)
        } else {
          await updateChecklist(payload as any)
        }

        toast({
          variant: 'success',
          title: '🎉 Success',
          description: `Checklist ${
            mode === 'create' ? 'created' : 'updated'
          } successfully`
        })

        router.push('/checklists/lists')
        router.refresh()
      } catch (error) {
        toast({
          variant: 'destructive',
          title: '🚨 Something went wrong!',
          description: 'Checklist could not be saved!'
        })
      } finally {
        setLoading(false)
      }
    },
    [user?.id, mode, router, toast, checklist?.questions, questions]
  )

  const { isSubmitting, isValid } = form.formState

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex gap-1 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              index < 3 ? 'bg-indigo-500' : 'bg-secondary'
            )}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Heading
          title="Create Checklist"
          description="Add a new checklist to your database"
          icon={<HelpCircle />}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-12 gap-4">
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-4">
                    <FormLabel>Type</FormLabel>
                    <Select
                      disabled={true}
                      onValueChange={field.onChange}
                      value={selectedOption || field.value}
                      defaultValue={selectedOption}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {checklistTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.slice(0, 1).toUpperCase() +
                              type.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="status"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Status</FormLabel>
                    <div className="pt-2 flex items-center gap-2">
                      <Switch
                        checked={field.value === FormStatus.Active}
                        onCheckedChange={(checked) => {
                          field.onChange(
                            checked ? FormStatus.Active : FormStatus.Passive
                          )
                        }}
                      />
                      <FormLabel>{field.value}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                name="pointIds"
                control={form.control}
                render={({ field }) => {
                  const currentValue =
                    mode === 'edit'
                      ? (checklist?.points as any[])?.map((point) => point.id)
                      : field.value

                  return (
                    <FormItem className="col-span-5">
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={pointOptions}
                          onValueChange={(value) => {
                            form.setValue('pointIds', value)
                            field.onChange(value)
                          }}
                          value={currentValue || []}
                          defaultValue={currentValue || []}
                          maxCount={2}
                          placeholder="Select points"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Enter checklist title"
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
            <div className="grid grid-cols-12 gap-4">
              <FormField
                name="groupIds"
                control={form.control}
                render={({ field }) => {
                  const currentGroupValue =
                    mode === 'edit'
                      ? (checklist?.groups as any[])?.map((group) => group.id)
                      : field.value

                  return (
                    <FormItem className="col-span-5">
                      <FormLabel>Groups</FormLabel>
                      <FormControl>
                        <div
                          className={cn(
                            !hasSelectedPoints &&
                              'opacity-50 pointer-events-none'
                          )}
                        >
                          <MultiSelect
                            options={groupOptions}
                            onValueChange={(value) => {
                              form.setValue('groupIds', value)
                              field.onChange(value)
                              // Filter models based on selected groups
                              const selectedGroupIds = new Set(value)
                              const filtered = models?.filter((model) =>
                                selectedGroupIds.has(model.vehicleGroupId)
                              )
                              setFilteredModels(filtered || [])
                              // Clear models selection when groups change
                              form.setValue('modelIds', [])
                            }}
                            value={currentGroupValue || []}
                            defaultValue={currentGroupValue || []}
                            maxCount={2}
                            disabled={!hasSelectedPoints}
                            placeholder="Select groups"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <FormField
                name="modelIds"
                control={form.control}
                render={({ field }) => {
                  const currentModelValue =
                    mode === 'edit'
                      ? (checklist?.models as any[])?.map((model) => model.id)
                      : field.value

                  return (
                    <FormItem className="col-span-5">
                      <FormLabel>Models</FormLabel>
                      <FormControl>
                        <div
                          className={cn(
                            !hasSelectedGroups &&
                              'opacity-50 pointer-events-none'
                          )}
                        >
                          <MultiSelect
                            options={modelOptions}
                            onValueChange={(value) => {
                              form.setValue('modelIds', value)
                              field.onChange(value)
                            }}
                            value={currentModelValue || []}
                            defaultValue={currentModelValue || []}
                            maxCount={2}
                            disabled={!hasSelectedGroups}
                            placeholder="Select models"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>

            <FormField
              name="questionIds"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Questions</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <MemoizedAddQuestionModal
                          questions={questions as any}
                          selectedQuestions={field.value || []}
                          selectedType={selectedType}
                          checklistQuestions={checklist?.questions || []}
                          onQuestionsChange={(value) => {
                            form.setValue('questionIds', value)
                            field.onChange(value)
                          }}
                        />
                        {field.value && field.value.length > 0 && (
                          <MemoizedDataTable
                            columns={selectedQuestionColumns}
                            data={filteredQuestions}
                            filterKey="name"
                            isAdd={false}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <div className="space-y-4">
              <FormLabel>Uploaded Files</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {watchedImages.length > 0 ? (
                      watchedImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-md overflow-hidden group border"
                        >
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No images uploaded
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Documents</h3>
                  <div className="space-y-2">
                    {watchedDocs.length > 0 ? (
                      watchedDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-2 p-2 border rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              {doc.split('/').pop()?.split('?')[0]}
                            </span>
                          </div>
                          <a
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            View
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No documents uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
              <Button
                type="button"
                variant="outline"
                disabled={!isValid || isSubmitting}
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
