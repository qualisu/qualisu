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
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'
import { DataTable } from '@/components/data-table'
import AddQuestionDialog from './add-question-dialog'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'
import { Separator } from '@/components/ui/separator'
import AddItemDialog from './add-item-dialog'
import { createChecklist } from '../api/server-actions'
import { Checklists, cTypes } from '@prisma/client'

interface Props {
  id?: string
  initialData: Checklists
  questions: any
  points: any
  groups: any
  models: any
  vehicles: any
}

export const checklistSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    itemNo: z.array(z.string()).optional(),
    type: z.enum(Object.values(cTypes) as [string, ...string[]]),
    checklistTypesId: z.string(),
    vehicleIds: z.array(z.string()).optional(),
    groupIds: z.array(z.string()).optional(),
    modelIds: z.array(z.string()).optional(),
    questions: z.array(z.string()).min(1, 'At least one question is required'),
    points: z
      .array(z.string())
      .min(1, 'At least one control point is required'),
    dateStart: z.string().optional(),
    dateEnd: z.string().optional()
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

export default function ChecklistForm({
  id,
  initialData,
  points,
  groups,
  models,
  vehicles,
  questions
}: Props) {
  const { toast } = useToast()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openAddQuestion, setOpenAddQuestion] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'part' | 'vehicle'>('part')

  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: initialData as any
  })

  const onSubmit = async (values: ChecklistFormValues) => {
    try {
      setLoading(true)

      const result = await createChecklist(values)

      if (!result) {
        throw new Error('Server returned no result')
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
      // await deleteChecklist(id)
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

  const onQuestionsSelected = (questions: any[]) => {
    setSelectedQuestions(questions)
    form.setValue(
      'questions',
      questions.map((q) => q.id),
      { shouldValidate: true }
    )
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
              name="type"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checklist Type</FormLabel>
                  <FormControl>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(cTypes).map((type: any) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                        options={points.map((point: any) => ({
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
                        placeholder="Select a point"
                        variant={'secondary' as const}
                        maxCount={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                <TabsContent value="part" className="mt-4"></TabsContent>
                <TabsContent value="vehicle" className="mt-4">
                  <div className="space-y-4">
                    <Controller
                      name="groupIds"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groups</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={groups.map((group: any) => ({
                                value: group.id,
                                label: group.name
                              }))}
                              onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue('groupIds', value, {
                                  shouldValidate: true
                                })
                              }}
                              defaultValue={field.value}
                              value={field.value}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Controller
                      name="modelIds"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Models</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={models.map((model: any) => ({
                                value: model.id,
                                label: model.name
                              }))}
                              onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue('modelIds', value, {
                                  shouldValidate: true
                                })
                                form.setValue('vehicleIds', [], {
                                  shouldValidate: true
                                })
                              }}
                              defaultValue={field.value}
                              value={field.value}
                              placeholder={
                                groups.length > 0
                                  ? 'Select models (optional)'
                                  : 'First select a group'
                              }
                              disabled={groups.length === 0}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Controller
                      name="vehicleIds"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicles</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={vehicles.map((vehicle: any) => ({
                                value: vehicle.id,
                                label: vehicle.name
                              }))}
                              onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue('vehicleIds', value, {
                                  shouldValidate: true
                                })
                              }}
                              defaultValue={field.value}
                              value={field.value}
                              placeholder={
                                (form.watch('groupIds') || []).length > 0
                                  ? 'Select vehicles (optional)'
                                  : 'First select a group'
                              }
                              disabled={!(form.watch('groupIds') || []).length}
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
                        questions={questions.filter((question: any) =>
                          question.checklistTypes.some(
                            (type: any) =>
                              type.id === form.watch('checklistTypesId')
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
