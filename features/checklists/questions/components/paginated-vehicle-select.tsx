'use client'

import { useEffect, useState, useCallback } from 'react'
import { MultiSelect } from '@/components/multi-select'
import { getFilteredVehicles } from '@/features/parameters/vehicles/api/server-actions'
import { useDebounce } from '@/app/hooks/use-debounce'

interface PaginatedVehicleSelectProps {
  onValueChange: (value: string[]) => void
  value?: string[]
  placeholder?: string
  disabled?: boolean
  selectedGroups?: string[]
  selectedModels?: string[]
  onSelect?: () => void
}

export function PaginatedVehicleSelect({
  onValueChange,
  value = [],
  placeholder,
  disabled,
  selectedGroups = [],
  selectedModels = [],
  onSelect
}: PaginatedVehicleSelectProps) {
  const [options, setOptions] = useState<
    { value: string; label: string; details: any }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const debouncedSearch = useDebounce(search, 300)

  const loadVehicles = useCallback(
    async (searchTerm: string, pageNum: number, append: boolean = false) => {
      if (!selectedGroups.length) {
        setOptions([])
        return
      }

      try {
        setLoading(true)
        const result = await getFilteredVehicles(
          searchTerm,
          pageNum,
          50,
          selectedGroups,
          selectedModels
        )

        if (result?.vehicles && result.vehicles.length > 0) {
          const newOptions = result.vehicles.map((vehicle: any) => ({
            value: vehicle.saseNo,
            label: `${vehicle.saseNo} - ${vehicle.country}`,
            // label: `${vehicle.saseNo} - ${vehicle.vehicleModel}`,
            details: {
              group: vehicle.vehicleGroup,
              model: vehicle.vehicleModel,
              warStart: new Date(vehicle.warStart).toLocaleDateString('tr-TR'),
              warEnd: new Date(vehicle.warEnd).toLocaleDateString('tr-TR'),
              country: vehicle.country
            }
          }))

          setOptions((prevOptions) =>
            append ? [...prevOptions, ...newOptions] : newOptions
          )
          setHasMore(result?.hasMore || false)
        } else {
          !append && setOptions([])
          setHasMore(false)
        }
      } catch (error) {
        console.error('Error loading vehicles:', error)
        !append && setOptions([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    },
    [selectedGroups, selectedModels]
  )

  useEffect(() => {
    const loadInitialVehicles = async () => {
      setPage(1)
      await loadVehicles(debouncedSearch, 1, false)
    }

    loadInitialVehicles()
  }, [debouncedSearch, loadVehicles, selectedGroups, selectedModels])

  const handleScrollToBottom = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadVehicles(search, nextPage, true)
    }
  }, [loading, hasMore, page, search, loadVehicles])

  return (
    <MultiSelect
      options={options}
      onValueChange={(value) => {
        onValueChange(value)
        onSelect?.()
      }}
      value={value || []}
      placeholder={loading ? 'Loading vehicles...' : placeholder}
      disabled={disabled || !selectedGroups.length}
      onSearch={setSearch}
      loading={loading}
      onScrollToBottom={handleScrollToBottom}
      renderOption={(option) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="font-medium text-sm">{option.label}</div>
          {/* <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="bg-secondary px-1.5 py-0.5 rounded-sm">
              {option.details.group}
            </span>
            <span>
              Garanti: {option.details.warStart} - {option.details.warEnd}
            </span>
            <span className="bg-secondary px-1.5 py-0.5 rounded-sm">
              {option.details.country}
            </span>
          </div> */}
        </div>
      )}
      maxCount={5}
      variant="secondary"
    />
  )
}
