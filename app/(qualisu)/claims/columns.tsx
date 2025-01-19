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

export type Claim = {
  id: string
  claimNumber: string
  claimDate: Date
  dealerNo: string
  dealerName: string
  failureCode: string
  claimType: string
  vinNo: string
  km: number
  amount: number
  status: string
  budget: number
  createdAt: Date
  updatedAt: Date
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
    accessorKey: 'claimNumber',
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
      return <p className="px-4">{row.original.claimNumber}</p>
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
    accessorKey: 'dealerNo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Dealer No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.dealerNo}</p>
    }
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
      return <p className="px-4">{row.original.failureCode}</p>
    }
  },
  {
    accessorKey: 'claimType',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Claim Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <p className="px-4">{row.original.claimType}</p>
    }
  },
  {
    accessorKey: 'vinNo',
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
      return <p className="px-4">{row.original.vinNo}</p>
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
      return <p className="px-4">{row.original.km.toLocaleString('tr-TR')}</p>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge className="capitalize" variant="secondary">
                {truncate(row.original.status, 10)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.original.status}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
  },
  {
    accessorKey: 'budget',
    header: 'Budget'
  }
]
