import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'

const multiSelectVariants = cva(
  'm-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300',
  {
    variants: {
      variant: {
        default:
          'border-foreground/10 text-foreground bg-card hover:bg-card/80',
        secondary:
          'border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        inverted: 'inverted'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: string
    /** The unique value associated with the option. */
    value: string
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>
    details?: any
  }[]

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void

  /** The default selected values when the component mounts. */
  defaultValue?: string[]

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string

  /**
   * The current selected values.
   * Optional, defaults to an empty array.
   */
  value?: string[]

  /**
   * If true, disables the multi-select component.
   * Optional, defaults to false.
   */
  disabled?: boolean

  /**
   * Callback function triggered when a search is performed.
   * Receives the search string.
   */
  onSearch?: (search: string) => void

  /**
   * If true, indicates that the multi-select component is loading.
   * Optional, defaults to false.
   */
  loading?: boolean

  /**
   * Callback function triggered when scrolling to the bottom of the component.
   */
  onScrollToBottom?: () => void

  /**
   * Callback function to render a custom option.
   * Receives the option object and returns a React node.
   */
  renderOption?: (option: {
    label: string
    value: string
    details?: any
  }) => React.ReactNode

  /**
   * Callback function to determine if an option should be included in the search results.
   * Receives the option and the search string.
   */
  searchable?: (option: any, search: string) => boolean
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = 'Select options',
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      value,
      disabled,
      onSearch,
      loading,
      onScrollToBottom,
      renderOption,
      searchable,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue)
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const [filteredOptions, setFilteredOptions] = React.useState(options)

    React.useEffect(() => {
      setFilteredOptions(options)
    }, [options])

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true)
      } else if (event.key === 'Backspace' && !event.currentTarget.value) {
        // Only handle removing selected values when input is empty
        const newSelectedValues = [...selectedValues]
        newSelectedValues.pop()
        setSelectedValues(newSelectedValues)
        onValueChange(newSelectedValues)
      }
    }

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option]
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const handleClear = () => {
      setSelectedValues([])
      onValueChange([])
    }

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev)
    }

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount)
      setSelectedValues(newSelectedValues)
      onValueChange(newSelectedValues)
    }

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear()
      } else {
        const allValues = options.map((option) => option.value)
        setSelectedValues(allValues)
        onValueChange(allValues)
      }
    }

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              'flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit',
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value)
                    const IconComponent = option?.icon
                    return (
                      <Badge
                        key={value}
                        className={cn(
                          isAnimating ? 'animate-bounce' : '',
                          multiSelectVariants({ variant })
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2" />
                        )}
                        {option?.label}
                        <XCircle
                          className="ml-2 h-4 w-4  cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            toggleOption(value)
                          }}
                        />
                      </Badge>
                    )
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge
                      className={cn(
                        'bg-transparent text-foreground border-foreground/1 hover:bg-transparent',
                        isAnimating ? 'animate-bounce' : '',
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedValues.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="h-4 mx-2 cursor-pointer text-muted-foreground "
                    onClick={(event) => {
                      event.stopPropagation()
                      handleClear()
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              value={inputValue}
              onValueChange={(value) => {
                const filtered = options.filter((option) =>
                  searchable
                    ? searchable(option, value)
                    : option.value.toLowerCase().startsWith(value.toLowerCase())
                )
                setFilteredOptions(filtered)
                setInputValue(value)
                if (onSearch) onSearch(value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace') {
                  const newValue = inputValue.slice(0, -1)
                  const filtered = options.filter((option) =>
                    searchable
                      ? searchable(option, newValue)
                      : option.value
                          .toLowerCase()
                          .startsWith(newValue.toLowerCase())
                  )
                  setFilteredOptions(filtered)
                }
              }}
              disabled={disabled}
            />
            <CommandList
              onScroll={(e) => {
                if (onScrollToBottom) {
                  const target = e.target as HTMLDivElement
                  if (
                    target.scrollHeight - target.scrollTop ===
                    target.clientHeight
                  ) {
                    onScrollToBottom()
                  }
                }
              }}
            >
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {loading ? (
                  <CommandItem disabled>Loading...</CommandItem>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = selectedValues.includes(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleOption(option.value)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <CheckIcon className={cn('h-4 w-4')} />
                        </div>
                        {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        {renderOption ? (
                          renderOption(option)
                        ) : (
                          <span>{option.label}</span>
                        )}
                      </CommandItem>
                    )
                  })
                )}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              'cursor-pointer my-2 text-foreground bg-background w-3 h-3',
              isAnimating ? '' : 'text-muted-foreground'
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    )
  }
)

MultiSelect.displayName = 'MultiSelect'
