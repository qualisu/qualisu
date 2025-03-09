'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { truncate } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Actions } from './actions'

export type QuestionCatalog = {
  id: string
  name: string
  desc: string
  type: string
  subCategoryId: string
  subCategoryName: string
  version: number
  answerType: string
  tags: { id: string; name: string }[]
  subCategory: {
    id: string
    name: string
    mainCategory: { id: string; name: string }
  }
}

export const columns: ColumnDef<QuestionCatalog>[] = [
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
          Question
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{truncate(row.original.name, 10)}</TooltipTrigger>
            <TooltipContent>
              <p>{row.original.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'version',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Version
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.version}</p>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <p className="px-4">
          {row.original.type.slice(0, 1).toUpperCase() +
            row.original.type.slice(1).toLowerCase()}
        </p>
      )
    }
  },
  {
    accessorKey: 'desc',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {row.original.desc ? (
                <Badge className="capitalize ml-2" variant="secondary">
                  {truncate(row.original.desc, 10)}
                </Badge>
              ) : (
                <Badge className="capitalize ml-2" variant="secondary">
                  No description
                </Badge>
              )}
            </TooltipTrigger>
            {row.original.desc && (
              <TooltipContent>
                <p className="">{row.original.desc}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'subCategoryName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Question Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <p className="px-4">
          {row.original.subCategory.mainCategory.name} /{' '}
          {row.original.subCategory.name}
        </p>
      )
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions id={row.original.id} />
  }
]
