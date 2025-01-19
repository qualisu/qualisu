'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Actions } from './actions'
import { Badge } from '@/components/ui/badge'
import {
  Points,
  Models,
  cTypes,
  Groups,
  Vehicles,
  cQuestions
} from '@prisma/client'

export type ChecklistsColumn = {
  id: string
  type: cTypes
  name: string
  desc: string
  points: Points[]
  groups: Groups[]
  models: Models[]
  vehicles: Vehicles[]
  questions: cQuestions[]
  userId: string
}

export const columns: ColumnDef<ChecklistsColumn>[] = [
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
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Checklist Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div className="px-4">{row.original.type || '-'}</div>
    }
  },
  {
    accessorKey: 'groups',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Groups
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="px-4">
          {row.original.groups.map((group) => group.name).join(', ')}
        </div>
      )
    }
  },
  {
    accessorKey: 'models',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Models
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="px-4">
          {row.original.models.map((model) => model.name).join(', ')}
        </div>
      )
    }
  },
  {
    accessorKey: 'points',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Points
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="px-4">
          {row.original.points.map((point) => point.name).join(', ')}
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
