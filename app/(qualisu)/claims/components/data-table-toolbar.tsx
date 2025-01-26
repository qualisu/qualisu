'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface DataTableToolbarProps {
  onSearch: (term: string) => void
  onDateFilter: (startDate?: Date | null, endDate?: Date | null) => void
  onFailureCodeFilter: (code?: string) => void
  onCountryFilter: (country?: string) => void
}

export function DataTableToolbar({
  onSearch,
  onDateFilter,
  onFailureCodeFilter,
  onCountryFilter
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search claims..."
          onChange={(event) => onSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex items-center space-x-2">
          <Input
            type="date"
            onChange={(event) => onDateFilter(event.target.valueAsDate, null)}
            className="h-8 w-[150px]"
          />
          <Input
            type="date"
            onChange={(event) => onDateFilter(null, event.target.valueAsDate)}
            className="h-8 w-[150px]"
          />
        </div>
        <Select
          onValueChange={(value) => onFailureCodeFilter(value || undefined)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Failure Code" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {/* Add your failure codes here */}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onCountryFilter(value || undefined)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {/* Add your countries here */}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onSearch('')
            onDateFilter(null, null)
            onFailureCodeFilter(undefined)
            onCountryFilter(undefined)
          }}
        >
          Reset Filters
          <Cross2Icon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
