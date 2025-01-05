'use client'

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { BadgeAlert, Trash, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Heading from '@/components/heading'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import { createChecklist, deleteChecklist } from '../api/server-actions'
import { MultiSelect } from '@/components/multi-select'
import {
  columns,
  QuestionsColumn
} from '@/app/(qualisu)/checklists/questions/questions-columns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ChecklistTypes } from '@prisma/client'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'
import { DataTable } from '@/components/data-table'
import AddQuestionDialog from './add-question-dialog'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'
import { Separator } from '@/components/ui/separator'
import AddItemDialog from './add-item-dialog'

interface Props {
  id?: string
  initialData: {
    id: string
    itemNo?: string[]
    groups?: { id: string; name: string }[]
    models?: { id: string; name: string; groupId: string }[]
    vehicles?: { id: string; name: string; modelId: string }[]
    questions?: QuestionsColumn[]
    points?: { id: string; name: string }[]
    dealers?: { id: string; name: string }[]
    checklistTypesId: string
    dateStart?: string
    dateEnd?: string
  }
  questions: QuestionsColumn[]
  checklistTypes: ChecklistTypes[]
  points: PointsColumn[]
  dealers: DealersColumn[]
  vehicles: { id: string; name: string; modelId: string }[]
  groups: { id: string; name: string }[]
  models: { id: string; name: string; groupId: string }[]
}

export const checklistSchema = z
  .object({
    id: z.string().optional(),
    itemNo: z.array(z.string()).optional(),
    vehicleIds: z.array(z.string()).optional(),
    groupIds: z.array(z.string()).optional(),
    modelIds: z.array(z.string()).optional(),
    questions: z.array(z.string()).min(1, 'At least one question is required'),
    dealers: z.array(z.string()).optional(),
    points: z
      .array(z.string())
      .min(1, 'At least one control point is required'),
    checklistTypesId: z.string().min(1, 'Checklist type is required'),
    dateStart: z.string().optional(),
    dateEnd: z.string().optional(),
    type: z.enum(['part', 'vehicle'])
  })
  .refine(
    (data) => {
      if (data.type === 'part') {
        return data.itemNo && data.itemNo.length > 0
      } else {
        return data.groupIds && data.groupIds.length > 0
      }
    },
    {
      message: 'Please select either Part Numbers or at least one Group'
    }
  )

export type ChecklistFormValues = z.infer<typeof checklistSchema>

// Add utility functions at the top
const updateFormField = (
  form: any,
  field: string,
  value: any,
  options = { shouldValidate: true, shouldTouch: true, shouldDirty: true }
) => {
  form.setValue(field, value, options)
}

const clearFormFields = (
  form: any,
  fields: string[],
  setters: { [key: string]: (value: any) => void }
) => {
  fields.forEach((field) => {
    updateFormField(form, field, [])
    if (setters[field]) {
      setters[field]([])
    }
  })
}

// Add type for MultiSelect options
interface SelectOption {
  value: string
  label: string
}

// Update the FormMultiSelect interface
interface FormMultiSelectProps {
  name: string
  label: string
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxCount?: number
  variant?: 'default' | 'secondary' | 'destructive' | 'inverted' | null
  form: any
  required?: boolean
}

// Add reusable MultiSelect component
const FormMultiSelect = ({
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  maxCount,
  variant,
  form,
  required = false
}: FormMultiSelectProps) => (
  <FormItem className="w-full">
    <FormLabel>
      {label}
      {required && ' *'}
    </FormLabel>
    <FormControl>
      <MultiSelect
        options={options}
        onValueChange={(value) => {
          onChange(value)
          updateFormField(form, name, value)
        }}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        maxCount={maxCount}
        variant={variant}
      />
    </FormControl>
    <FormMessage />
  </FormItem>
)

export default function ChecklistForm({
  id,
  initialData,
  questions,
  checklistTypes,
  points,
  dealers,
  vehicles,
  groups,
  models
}: Props) {
  const { toast } = useToast()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [openAddQuestion, setOpenAddQuestion] = useState(false)
  const [openAddItem, setOpenAddItem] = useState(false)
  const [loading, setLoading] = useState(false)

  const [selectedQuestions, setSelectedQuestions] = useState<QuestionsColumn[]>(
    initialData?.questions ?? []
  )

  const [selectedPoints, setSelectedPoints] = useState<string[]>(
    initialData?.points?.map((point) => point.id) ?? []
  )

  const [selectedDealers, setSelectedDealers] = useState<string[]>(
    initialData?.dealers?.map((dealer) => dealer.id) ?? []
  )

  const [itemNo, setItemNo] = useState<string[]>(
    initialData.itemNo ? initialData.itemNo : []
  )

  const [selectedGroups, setSelectedGroups] = useState<string[]>(
    initialData?.groups?.map((g) => g.id) ?? []
  )
  const [selectedModels, setSelectedModels] = useState<string[]>(
    initialData?.models?.map((m) => m.id) ?? []
  )
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    initialData?.vehicles?.map((v) => v.id) ?? []
  )

  const [selectedTab, setSelectedTab] = useState<'part' | 'vehicle'>(
    (initialData?.groups?.length ?? 0) > 0 ? 'vehicle' : 'part'
  )

  const filteredModels =
    selectedGroups.length > 0
      ? models.filter((model) => selectedGroups.includes(model.groupId))
      : []

  const filteredVehicles =
    selectedModels.length > 0
      ? vehicles.filter((vehicle) => selectedModels.includes(vehicle.modelId))
      : []

  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    mode: 'all',
    defaultValues: {
      id: initialData.id,
      itemNo: itemNo,
      vehicleIds: initialData?.vehicles?.map((v) => v.id) ?? [],
      groupIds: selectedGroups,
      modelIds: initialData?.models?.map((m) => m.id) ?? [],
      dealers: selectedDealers,
      points: initialData?.points?.map((point) => point.id) ?? [],
      questions: initialData?.questions?.map((question) => question.id) ?? [],
      checklistTypesId: initialData.checklistTypesId,
      dateStart: initialData.dateStart,
      dateEnd: initialData.dateEnd,
      type: selectedTab
    }
  })

  // Watch for changes in points
  useEffect(() => {
    if (initialData?.points?.length) {
      const pointIds = initialData.points.map((point) => point.id)
      setSelectedPoints(pointIds)
      form.setValue('points', pointIds)
    }
  }, [initialData?.points, form])

  // Set up initial state for groups, models, and vehicles
  useEffect(() => {
    if (initialData?.groups?.length) {
      const groupIds = initialData.groups.map((group) => group.id)
      setSelectedGroups(groupIds)
      form.setValue('groupIds', groupIds)
    }

    if (initialData?.models?.length) {
      const modelIds = initialData.models.map((model) => model.id)
      setSelectedModels(modelIds)
      form.setValue('modelIds', modelIds)
    }

    if (initialData?.vehicles?.length) {
      const vehicleIds = initialData.vehicles.map((vehicle) => vehicle.id)
      setSelectedVehicles(vehicleIds)
      form.setValue('vehicleIds', vehicleIds)
    }
  }, [initialData?.groups, initialData?.models, initialData?.vehicles, form])

  // Add useEffect for questions initialization
  useEffect(() => {
    if (initialData?.questions?.length) {
      setSelectedQuestions(initialData.questions)
      form.setValue(
        'questions',
        initialData.questions.map((q) => q.id),
        {
          shouldValidate: true,
          shouldTouch: true,
          shouldDirty: true
        }
      )
    }
  }, [initialData?.questions, form])

  const watchType = form.watch('type')
  const watchGroupIds = form.watch('groupIds')
  const watchItemNo = form.watch('itemNo')

  const isFormValid = () => {
    const type = form.getValues('type')
    const itemNo = form.getValues('itemNo')
    const groupIds = form.getValues('groupIds')
    const questions = form.getValues('questions')
    const points = form.getValues('points')

    if (!form.getValues('checklistTypesId')) return false
    if (!points || points.length === 0) return false
    if (!questions || questions.length === 0) return false

    if (type === 'part') {
      return itemNo && itemNo.length > 0
    } else {
      return groupIds && groupIds.length > 0
    }
  }

  // Update the handleChecklistTypeChange function
  const handleChecklistTypeChange = (value: string) => {
    const fieldsToReset = [
      'itemNo',
      'vehicleIds',
      'groupIds',
      'modelIds',
      'questions',
      'points',
      'dealers'
    ]

    const setters = {
      questions: setSelectedQuestions,
      points: setSelectedPoints,
      dealers: setSelectedDealers,
      groupIds: setSelectedGroups,
      modelIds: setSelectedModels,
      vehicleIds: setSelectedVehicles,
      itemNo: setItemNo
    }

    updateFormField(form, 'checklistTypesId', value)
    clearFormFields(form, fieldsToReset, setters)
  }

  // Update the tab change handler
  const handleTabChange = (value: 'part' | 'vehicle') => {
    setSelectedTab(value)
    updateFormField(form, 'type', value)

    const fieldsToReset =
      value === 'part' ? ['vehicleIds', 'groupIds', 'modelIds'] : ['itemNo']

    const setters = {
      vehicleIds: setSelectedVehicles,
      groupIds: setSelectedGroups,
      modelIds: setSelectedModels,
      itemNo: setItemNo
    }

    clearFormFields(form, fieldsToReset, setters)
  }

  // Update the validation messages
  const validationMessages = {
    checklistType: 'Please select a checklist type',
    controlPoint: 'Please select at least one control point',
    question: 'Please select at least one question',
    partNumber: 'Please add at least one part number',
    group: 'Please select at least one group'
  } as const

  // Update the validation function
  const validateForm = (values: ChecklistFormValues) => {
    const validations = [
      {
        condition: !values.checklistTypesId,
        message: validationMessages.checklistType
      },
      {
        condition: !values.points?.length,
        message: validationMessages.controlPoint
      },
      {
        condition: !selectedQuestions.length,
        message: validationMessages.question
      },
      {
        condition: values.type === 'part' && !values.itemNo?.length,
        message: validationMessages.partNumber
      },
      {
        condition: values.type === 'vehicle' && !values.groupIds?.length,
        message: validationMessages.group
      }
    ]

    const error = validations.find((v) => v.condition)
    if (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Validation Error',
        description: error.message
      })
      return false
    }
    return true
  }

  // Update the onSubmit function
  const onSubmit = async (values: ChecklistFormValues) => {
    try {
      setLoading(true)

      if (!validateForm(values)) {
        setLoading(false)
        return
      }

      const submissionData = {
        ...values,
        id: initialData.id,
        type: selectedTab,
        itemNo: selectedTab === 'part' ? itemNo : [],
        groupIds: selectedTab === 'vehicle' ? selectedGroups : [],
        modelIds: selectedTab === 'vehicle' ? selectedModels : [],
        vehicleIds: selectedTab === 'vehicle' ? selectedVehicles : [],
        questions: selectedQuestions.map((q) => q.id),
        points: values.points,
        dealers: values.dealers,
        checklistTypesId: values.checklistTypesId,
        dateStart: values.dateStart,
        dateEnd: values.dateEnd
      }

      const result = await createChecklist(submissionData)

      if (!result) {
        throw new Error('Server returned no result')
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        variant: 'success',
        title: '🎉 Success',
        description: id
          ? 'Checklist updated successfully'
          : 'Checklist created successfully'
      })

      router.push('/checklists/lists')
      router.refresh()
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        variant: 'destructive',
        title: '🚨 Error',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while saving the checklist.'
      })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteChecklist(id)
      toast({
        variant: 'success',
        title: '🎉 Checklist deleted',
        description: 'Checklist deleted successfully'
      })
      router.push('/checklists/lists')
      router.refresh()
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

  const onQuestionsSelected = (questions: QuestionsColumn[]) => {
    setSelectedQuestions(questions)
    const questionIds = questions.map((q) => q.id)
    form.setValue('questions', questionIds, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true
    })
  }

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
            title={id ? 'Edit Checklist' : 'Create Checklist'}
            description="Please create checklists for controls."
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
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(onSubmit)(e)
            }}
          >
            <Controller
              name="checklistTypesId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checklist Type</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        handleChecklistTypeChange(value)
                        field.onChange(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {checklistTypes.map((checklistType) => (
                          <SelectItem
                            key={checklistType.id}
                            value={checklistType.id}
                          >
                            {checklistType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-4 w-full">
              <Controller
                name="points"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Control Point(s)</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={points.map((point) => ({
                          value: point.id,
                          label: point.name
                        }))}
                        onValueChange={(value) => {
                          setSelectedPoints(value)
                          field.onChange(value)
                          form.setValue('points', value, {
                            shouldValidate: true
                          })
                        }}
                        defaultValue={field.value}
                        placeholder="Select a point"
                        variant={'secondary' as const}
                        maxCount={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('checklistTypesId') ===
                'cm120jwiw0001iu5xbglmdu8h' && (
                <Controller
                  name="dealers"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Dealer(s)</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={dealers.map((dealer) => ({
                            value: dealer.id,
                            label: dealer.name
                          }))}
                          onValueChange={(value) => {
                            setSelectedDealers(value)
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
              )}
            </div>
            <Separator />
            <div className="flex flex-col gap-4">
              <Tabs
                defaultValue={selectedTab}
                onValueChange={(value) => {
                  const tabValue = value as 'part' | 'vehicle'
                  setSelectedTab(tabValue)
                  form.setValue('type', tabValue, {
                    shouldValidate: true,
                    shouldTouch: true,
                    shouldDirty: true
                  })

                  if (tabValue === 'part') {
                    form.setValue('vehicleIds', [], { shouldValidate: true })
                    form.setValue('groupIds', [], { shouldValidate: true })
                    form.setValue('modelIds', [], { shouldValidate: true })
                    setSelectedVehicles([])
                    setSelectedGroups([])
                    setSelectedModels([])
                  } else {
                    form.setValue('itemNo', [], { shouldValidate: true })
                    setItemNo([])
                  }
                }}
              >
                <TabsList className="flex w-full">
                  <TabsTrigger value="part" className="flex-1">
                    Part Numbers
                  </TabsTrigger>
                  <TabsTrigger value="vehicle" className="flex-1">
                    Vehicle
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="part" className="mt-4">
                  <Controller
                    name="itemNo"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Item No(s)</FormLabel>
                        <FormControl>
                          <>
                            <AddItemDialog
                              id={id}
                              isOpen={openAddItem}
                              onClose={() => setOpenAddItem(false)}
                              onItemAdd={(item) => {
                                if (!field.value?.includes(item)) {
                                  const updatedItemNo = [
                                    ...(field.value || []),
                                    item
                                  ]
                                  setItemNo(updatedItemNo)
                                  field.onChange(updatedItemNo)
                                }
                              }}
                            />

                            <DataTable
                              columns={[
                                {
                                  accessorKey: 'itemNo',
                                  header: 'Item No'
                                },
                                {
                                  id: 'actions',
                                  header: 'Actions',
                                  cell: ({ row }) => (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newItemNo =
                                          field.value?.filter(
                                            (item) =>
                                              item !== row.original.itemNo
                                          ) || []
                                        setItemNo(newItemNo)
                                        field.onChange(newItemNo)
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )
                                }
                              ]}
                              isAdd={true}
                              onAdd={() => setOpenAddItem(true)}
                              data={(field.value || []).map((item) => ({
                                itemNo: item
                              }))}
                              filterKey="itemNo"
                            />
                          </>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="vehicle" className="mt-4">
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Groups</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={groups.map((group) => ({
                            value: group.id,
                            label: group.name
                          }))}
                          onValueChange={(value) => {
                            setSelectedGroups(value)
                            // Clear model and vehicle selections when groups change
                            setSelectedModels([])
                            setSelectedVehicles([])
                            form.setValue('groupIds', value, {
                              shouldValidate: true
                            })
                            form.setValue('modelIds', [], {
                              shouldValidate: true
                            })
                            form.setValue('vehicleIds', [], {
                              shouldValidate: true
                            })
                          }}
                          defaultValue={selectedGroups}
                          value={selectedGroups}
                          placeholder="Select groups"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Models</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={filteredModels.map((model) => ({
                            value: model.id,
                            label: model.name
                          }))}
                          onValueChange={(value) => {
                            const validValues = value.filter((v) =>
                              filteredModels.some((m) => m.id === v)
                            )
                            setSelectedModels(validValues)
                            setSelectedVehicles([])
                            form.setValue('modelIds', validValues, {
                              shouldValidate: true
                            })
                            form.setValue('vehicleIds', [], {
                              shouldValidate: true
                            })
                          }}
                          defaultValue={selectedModels.filter((modelId) =>
                            filteredModels.some((m) => m.id === modelId)
                          )}
                          value={selectedModels.filter((modelId) =>
                            filteredModels.some((m) => m.id === modelId)
                          )}
                          placeholder={
                            selectedGroups.length > 0
                              ? 'Select models (optional)'
                              : 'First select a group'
                          }
                          disabled={selectedGroups.length === 0}
                        />
                      </FormControl>
                    </FormItem>

                    <Controller
                      name="vehicleIds"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicles</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={filteredVehicles.map((vehicle) => ({
                                value: vehicle.id,
                                label: vehicle.name
                              }))}
                              onValueChange={(value) => {
                                setSelectedVehicles(value)
                                field.onChange(value)
                                form.setValue('vehicleIds', value, {
                                  shouldValidate: true
                                })
                              }}
                              defaultValue={field.value}
                              value={selectedVehicles}
                              placeholder={
                                selectedModels.length > 0
                                  ? 'Select vehicles (optional)'
                                  : selectedGroups.length > 0
                                  ? 'First select a model'
                                  : 'First select a group'
                              }
                              disabled={selectedModels.length === 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <Separator />
            <Controller
              name="questions"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Question(s)</FormLabel>
                  <FormControl>
                    <div>
                      <AddQuestionDialog
                        id={id}
                        checklistTypesId={form.watch('checklistTypesId')}
                        activeQuestions={selectedQuestions}
                        questions={questions.filter((question) =>
                          question.checklistTypes.some(
                            (type) => type.id === form.watch('checklistTypesId')
                          )
                        )}
                        isOpen={openAddQuestion}
                        onClose={() => setOpenAddQuestion(false)}
                        onQuestionsSelected={onQuestionsSelected}
                        currentSelectedQuestions={selectedQuestions}
                      />

                      <DataTable
                        columns={columns}
                        data={selectedQuestions}
                        filterKey="name"
                        isAdd={true}
                        onAdd={() => {
                          if (!form.watch('checklistTypesId')) {
                            toast({
                              variant: 'destructive',
                              title: '🚨 Error',
                              description:
                                'Please select a checklist type first'
                            })
                            return
                          }
                          setOpenAddQuestion(true)
                        }}
                      />
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
                onClick={() => router.push('/checklists/lists')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || loading}
                onClick={() => {}}
              >
                {isSubmitting || loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
