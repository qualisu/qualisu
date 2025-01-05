'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { ChecklistTypes, FormStatus, Tags } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Actions } from './actions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type QuestionsColumn = {
  id: string
  name: string
  description: string
  grade: string
  category: string
  subCategory: string
  subCategoriesId: string
  tags: Tags[]
  images: string[]
  checklistTypes: ChecklistTypes[]
  status: FormStatus
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<QuestionsColumn>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: 'checklistTypes',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Types
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          {row.original.checklistTypes.map((type) => (
            <Badge key={type.id} variant="outline" className="mr-1">
              {type.name}
            </Badge>
          ))}
        </div>
      )
    }
  },
  {
    accessorKey: 'subCategory',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.original.category} - {row.original.subCategory}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="text-center w-full" // Center the header
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          {' '}
          {/* Center the cell content */}
          <Badge
            className={cn(
              row.original.status === FormStatus.Active
                ? 'bg-green-600'
                : 'bg-red-600',
              'capitalize'
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created Date'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated Date'
  },

  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions id={row.original.id} />
  }
]
