// components/ui/combobox.tsx
'use client'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Seçim yapın...',
  multiple = false,
  className
}: {
  options: Array<{ value: string; label: string }>
  value: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedLabels = Array.isArray(value)
    ? value
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean)
    : [options.find((o) => o.value === value)?.label]

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const newValue = value.includes(selectedValue)
        ? (value as string[]).filter((v) => v !== selectedValue)
        : [...(value as string[]), selectedValue]
      onChange(newValue)
    } else {
      onChange(selectedValue)
      setOpen(false)
    }
  }

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <span className="truncate">
            {selectedLabels.length > 0
              ? selectedLabels.join(', ')
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Ara..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>Sonuç bulunamadı</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      (
                        multiple
                          ? value.includes(option.value)
                          : value === option.value
                      )
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
