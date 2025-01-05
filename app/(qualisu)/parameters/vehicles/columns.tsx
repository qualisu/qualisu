'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { FormStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Actions } from './actions'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type VehiclesColumn = {
  id: string
  name: string
  shortCode: string
  vinCode: string
  model: string
  group: string
  images: string[]
  status: FormStatus
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<VehiclesColumn>[] = [
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
    accessorKey: 'group',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Group
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: 'model',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Model
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
          Vehicle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
            'capitalize'
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
    cell: ({ row }) => <Actions id={row.original.id} />
  }
]
