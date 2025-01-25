'use client'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { Actions } from './actions'
import { DataTableColumnHeader } from '@/components/data-table-column-header'

export type VehiclesColumn = {
  id: string
  saseNo: string
  warStart: Date
  warEnd: Date
  vehicleGroup: string
  vehicleModel: string
  prodDate: Date
  country: string
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
    accessorKey: 'saseNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="VIN No" />
    )
  },
  {
    accessorKey: 'vehicleGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle Group" />
    )
  },
  {
    accessorKey: 'vehicleModel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vehicle Model" />
    )
  },
  {
    accessorKey: 'prodDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Production Date" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('prodDate')), 'dd/MM/yyyy')
  },
  {
    accessorKey: 'country',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Country" />
    )
  },
  {
    accessorKey: 'warStart',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warranty Start" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('warStart')), 'dd/MM/yyyy')
  },
  {
    accessorKey: 'warEnd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Warranty End" />
    ),
    cell: ({ row }) => format(new Date(row.getValue('warEnd')), 'dd/MM/yyyy')
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions id={row.original.id} />
  }
]
