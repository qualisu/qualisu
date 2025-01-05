'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Input } from './ui/input'
import { Button } from './ui/button'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { FormStatus } from '@prisma/client'
import { PlusIcon } from 'lucide-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterKey: string
  isAdd: boolean
  onAdd?: () => void
}

export function DataTableToolbar<TData>({
  table,
  filterKey,
  isAdd,
  onAdd
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter ${filterKey}...`}
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(filterKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={[
              { label: 'Active', value: FormStatus.Active },
              { label: 'Passive', value: FormStatus.Passive }
            ]}
          />
        )} */}
        {/* {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )} */}
      </div>
      {isAdd && (
        <Button
          variant="default"
          size="sm"
          type="button"
          className="ml-auto font-normal text-xs"
          onClick={onAdd}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add
        </Button>
      )}
    </div>
  )
}
