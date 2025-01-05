'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Actions } from './actions'
import { Badge } from '@/components/ui/badge'
import { QuestionsColumn } from '../questions/questions-columns'
import { ChecklistTypes, Points } from '@prisma/client'

export type ChecklistsColumn = {
  id: string
  itemNo: string[]
  groups: string[]
  models: string[]
  vehicle: string[]
  questions: QuestionsColumn[]
  checklistTypes: ChecklistTypes
  dealers: string[]
  points: Points[]
  simulators: any[]
  checklistTypesId: string
  dateStart: string
  dateEnd: string
  createdAt: string
  updatedAt: string
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
    accessorKey: 'checklistTypes',
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
      return (
        <div className="px-4">{row.original.checklistTypes.name || '-'}</div>
      )
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
        <div className="flex flex-wrap gap-x-2 px-4">
          {row.original.groups.slice(0, 2).map((item: any) => (
            <Badge key={item.id}>{item}</Badge>
          ))}
          {row.original.groups.length > 2 && (
            <Badge>{`+ ${row.original.groups.length - 2} more`}</Badge>
          )}
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
        <div className="flex flex-wrap gap-x-2 px-4">
          {row.original.models.slice(0, 2).map((item: any) => (
            <Badge key={item.id}>{item}</Badge>
          ))}
          {row.original.models.length > 2 && (
            <Badge>{`+ ${row.original.models.length - 2} more`}</Badge>
          )}
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
        <div className="flex flex-wrap gap-2 px-4">
          {row.original.points.slice(0, 2).map((point: any) => (
            <Badge key={point.id}>{point.name}</Badge>
          ))}
          {row.original.points.length > 2 && (
            <Badge>{`+ ${row.original.points.length - 2} more`}</Badge>
          )}
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
