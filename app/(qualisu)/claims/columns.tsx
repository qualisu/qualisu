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
import { format } from 'date-fns'
import { FailureCodes, VehicleGroup, VehicleModel } from '@prisma/client'

export type Claim = {
  claimNo: string
  claimDate: Date
  country: string
  dealerName: string
  saseNo: string
  kilometre: number
  budgetNo: string
  amount: number
  models: VehicleModel
  groups: VehicleGroup
  failures: FailureCodes
}

export const columns: ColumnDef<Claim>[] = [
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
    accessorKey: 'claimNo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claim Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.claimNo}</p>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'claimDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claim Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.getValue('claimDate')), 'dd/MM/yyyy')
  },
  {
    accessorKey: 'dealerName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Dealer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="capitalize ml-2" variant="secondary">
                {truncate(row.original.dealerName, 10)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="">{row.original.dealerName}</p>
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
    accessorKey: 'failureCode',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Failure Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.failures.code}</p>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'vehicleModel',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Vehicle Model
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.models.name}</p>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'saseNo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          VIN No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.saseNo}</p>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'km',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          KM
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <p className="px-4">{row.original.kilometre.toLocaleString('tr-TR')}</p>
      )
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    }
  },

  {
    accessorKey: 'amount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge className="capitalize" variant="destructive">
          {row.original.amount.toLocaleString('tr-TR')}
        </Badge>
      )
    }
  }
]
