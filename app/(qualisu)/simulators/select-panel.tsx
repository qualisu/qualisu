'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

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
import { Search } from 'lucide-react'

interface SelectPanelProps {
  points: any[]
  groups: any[]
  users: any[]
  onChecklistChange: (newChecklist: any[]) => void
  setChecklistType: (type: string) => void
  setItemNo: (itemNo: string) => void
  setPointsId: (pointsId: string) => void
}

export const formSchema = z.object({
  pointsId: z.string().optional(),
  groupId: z.string().optional(),
  itemNo: z.string().optional(),
  searchQuery: z.string().optional()
})

export type FormValues = z.infer<typeof formSchema>

export default function SelectPanel({
  points,
  groups,
  users,
  onChecklistChange,
  setChecklistType,
  setItemNo,
  setPointsId
}: SelectPanelProps) {
  const { toast } = useToast()
  const [filteredPoints, setFilteredPoints] = useState(points)
  const [filteredGroups, setFilteredGroups] = useState(groups)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pointsId: '',
      groupId: '',
      itemNo: '',
      searchQuery: ''
    }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: FormValues) => {
    try {
      let checklists: any[] = []
      if (values.pointsId) {
        checklists =
          (await getMandatoryChecklists({
            pointId: values.pointsId,
            groupId: values.groupId,
            itemNo: values.itemNo,
            searchQuery: values.searchQuery
          })) || []
      }
      onChecklistChange(checklists)
      setChecklistType(values.itemNo ? 'vehicle' : 'prev')
      setItemNo(values.itemNo ?? '')
      setPointsId(values.pointsId ?? '')
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

  const handleSearch = (query: string) => {
    const searchTerm = query.toLowerCase()

    setFilteredPoints(
      points.filter((point) => point.name.toLowerCase().includes(searchTerm))
    )
    setFilteredGroups(
      groups.filter((group) => group.name.toLowerCase().includes(searchTerm))
    )
  }

  const handleChecklistTypeChange = (value: string) => {
    form.setValue('pointsId', value)
    form.setValue('itemNo', '')
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="searchQuery"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search points and groups..."
                      className="pl-8"
                      onChange={(e) => {
                        field.onChange(e.target.value)
                        handleSearch(e.target.value)
                      }}
                    />
                  </div>
                </FormControl>
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
                    disabled={isSubmitting}
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
            name="groupId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select User Group</FormLabel>
                <FormControl>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.role}
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
                    maxLength={12}
                    minLength={12}
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
