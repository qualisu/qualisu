'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

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

  // Get all columns that have filterFn defined
  const filterableColumns = table.getAllColumns().filter(
    (column) =>
      typeof column.columnDef.filterFn === 'function' && column.id !== filterKey // Exclude the main filter key as it has its own input
  )

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={`Filter ${filterKey}...`}
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn(filterKey)?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filterableColumns.map((column) => {
          const facetedValues = column.getFacetedUniqueValues()
          const options = Array.from(facetedValues.keys()).map((value) => ({
            label: String(value),
            value: String(value)
          }))

          if (options.length > 0) {
            return (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                title={column.id.charAt(0).toUpperCase() + column.id.slice(1)} // Capitalize first letter
                options={options}
              />
            )
          }
          return null
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isAdd && onAdd && (
          <Button onClick={onAdd} size="sm">
            Add New
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
