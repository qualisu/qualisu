'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Points, User, UserGroups } from '@prisma/client'

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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { getMandatoryChecklists } from '@/features/simulators/api/server-actions'

interface SelectPanelProps {
  user: User & { userGroups: (UserGroups & { points: Points[] })[] }
  onChecklistChange: (newChecklist: any[]) => void
}

export const formSchema = z.object({
  pointsId: z.string().optional(),
  userGroupId: z.string().optional(),
  itemNo: z.string().optional()
})

export type FormValues = z.infer<typeof formSchema>

export default function SelectPanel({
  user,
  onChecklistChange
}: SelectPanelProps) {
  const { toast } = useToast()
  const [filteredPoints, setFilteredPoints] = useState<Points[]>([])
  const [filteredGroups, setFilteredGroups] = useState(user.userGroups)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pointsId: '',
      userGroupId: '',
      itemNo: ''
    }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: FormValues) => {
    try {
      let checklists: any[] = []
      if (values.pointsId) {
        if (values.itemNo) {
          localStorage.setItem('checklist_item_no', values.itemNo)
        }

        checklists =
          (await getMandatoryChecklists({
            pointId: values.pointsId,
            itemNo: values.itemNo
          })) || []
      }
      onChecklistChange(checklists)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Error Message',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while fetching the checklists.'
      })
    }
  }

  const handleChecklistTypeChange = (value: string) => {
    form.setValue('pointsId', value)
    form.setValue('itemNo', '')
  }

  const handleUserGroupChange = (value: string) => {
    form.setValue('userGroupId', value)
    form.setValue('pointsId', '')

    if (value) {
      const selectedGroup = user.userGroups.find((group) => group.id === value)
      setFilteredPoints(selectedGroup?.points || [])
    } else {
      setFilteredPoints([])
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="userGroupId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select User Group</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(value) => {
                      handleUserGroupChange(value)
                      field.onChange(value)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
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
            name="pointsId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Station</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSubmitting || !form.getValues('userGroupId')}
                    onValueChange={(value) => {
                      handleChecklistTypeChange(value)
                      field.onChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a station" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          {point.name}
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
            name="itemNo"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter the barcode number"
                    value={field.value || ''}
                    onChange={field.onChange}
                    maxLength={17}
                    minLength={17}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size="sm" type="submit" disabled={!isValid || isSubmitting}>
            Get Checklists
          </Button>
        </form>
      </Form>
    </>
  )
}
