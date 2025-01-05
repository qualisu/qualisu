'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import {
  type Points,
  type ChecklistTypes,
  type UserGroups
} from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { UserGroupActions } from './user-group-actions'

export type UserGroupColumn = UserGroups & {
  points: Points[]
  types: ChecklistTypes[]
  usersCount: number
  pointsCount: number
  typesCount: number
}

interface DataTableProps {
  points: Points[]
  types: ChecklistTypes[]
}

export const columns = ({
  points,
  types
}: DataTableProps): ColumnDef<UserGroupColumn>[] => [
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
    accessorKey: 'usersCount',
    header: 'Users',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.usersCount}</Badge>
    }
  },
  {
    accessorKey: 'pointsCount',
    header: 'Points',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.pointsCount}</Badge>
    }
  },
  {
    accessorKey: 'typesCount',
    header: 'Types',
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.typesCount}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <UserGroupActions
        userGroup={row.original}
        points={points}
        types={types}
      />
    )
  }
]
