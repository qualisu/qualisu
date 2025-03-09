'use client'

import { Table } from '@tanstack/react-table'

import { Input } from './ui/input'
import { Button } from './ui/button'
import { ChevronDown, PlusIcon, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

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
  const handleFilter = (value: string) => {
    table.getColumn(filterKey)?.setFilterValue(value)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter..."
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ''}
          onChange={(event) => handleFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columns <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
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
