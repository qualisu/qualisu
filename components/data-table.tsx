'use client'

import { useState } from 'react'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  Table as TableInstance
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from '@/app/(qualisu)/claims/components/data-table-toolbar'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterKey: string
  disabled?: boolean
  isAdd: boolean
  onAdd?: () => void
  meta?: Record<string, unknown>
  enableRowSelection?: boolean
  rowSelection?: Record<number, boolean>
  onRowSelectionChange?: (value: Record<number, boolean>) => void
  facetedFilters?: {
    column: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
  toolbar?: React.ComponentType<{
    table: TableInstance<TData>
    filterKey: string
    isAdd: boolean
    onAdd?: () => void
  }>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  isAdd,
  onAdd,
  meta,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  facetedFilters,
  toolbar: Toolbar
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection: rowSelection || {},
      columnFilters
    },
    enableRowSelection: !!enableRowSelection,
    onRowSelectionChange: (updaterOrValue) => {
      if (typeof updaterOrValue === 'function') {
        const newValue = updaterOrValue(rowSelection || {})
        onRowSelectionChange?.(newValue as Record<number, boolean>)
      } else {
        onRowSelectionChange?.(updaterOrValue as Record<number, boolean>)
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const itemValue = row.getValue(columnId) as string
        return itemValue.toLowerCase().includes(value.toLowerCase())
      },
      categoryFilter: (row, id, filterValue) => {
        if (!filterValue?.length) return true
        const rowValue = row.getValue(id)
        return filterValue.includes(rowValue)
      }
    },
    meta
  })

  return (
    <div className="space-y-4">
      {Toolbar ? (
        <Toolbar
          table={table}
          filterKey={filterKey}
          isAdd={isAdd}
          onAdd={onAdd}
        />
      ) : (
        <DataTableToolbar
          table={table}
          filterKey={filterKey}
          facetedFilters={facetedFilters}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        currentPage={table.getState().pagination.pageIndex + 1}
        pageCount={table.getPageCount()}
        onPageChange={(page) => table.setPageIndex(page - 1)}
      />
    </div>
  )
}
