'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { FailureCodes, FormStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SubActions } from './sub-actions'

export type SubCategoriesColumn = {
  id: string
  name: string
  mainCategoryId: string
  mainCategory: string
  failureCodes: FailureCodes[]
  status: FormStatus
  createdAt: string
  updatedAt: string
}

export const subColumns: ColumnDef<SubCategoriesColumn>[] = [
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
    accessorKey: 'mainCategory',
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
      return <div className="ml-4">{row.original.mainCategory}</div>
    }
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
    },
    cell: ({ row }) => {
      return <div className="ml-4">{row.original.name}</div>
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge
          className={cn(
            row.original.status === FormStatus.Active
              ? 'bg-green-600'
              : 'bg-red-600',
            'capitalize ml-4'
          )}
        >
          {row.original.status}
        </Badge>
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
    cell: ({ row }) => <SubActions id={row.original.id} />
  }
]
