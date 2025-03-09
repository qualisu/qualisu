import * as React from 'react'
import { XIcon, PlusCircleIcon, CheckIcon, XCircle } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Tag {
  id: string
  name: string
}

interface CreatableTagsInputProps {
  availableTags: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxTags?: number
  createable?: boolean
}

export function CreatableTagsInput({
  availableTags,
  selectedTags,
  onTagsChange,
  placeholder = 'Select tags...',
  disabled = false,
  maxTags = Infinity,
  createable = true
}: CreatableTagsInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tagId])
      }
    }
  }

  const handleRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter((id) => id !== tagId))
  }

  const handleCreateTag = () => {
    if (!inputValue.trim()) return

    // Check if tag already exists
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    )

    if (existingTag) {
      // If it exists but isn't selected, select it
      if (!selectedTags.includes(existingTag.id)) {
        handleSelect(existingTag.id)
      }
    } else {
      // For new tags, we'd typically call an API to create them
      // Here we're simulating by creating a tag with the input as both id and name
      // In a real app, this would be handled by the parent component
      onTagsChange([...selectedTags, inputValue])
    }

    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && createable && inputValue) {
      e.preventDefault()
      handleCreateTag()
    }
  }

  const showCreateOption =
    createable &&
    inputValue &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    )

  const selectedTagObjects = selectedTags.map((id) => {
    const existingTag = availableTags.find((tag) => tag.id === id)
    return existingTag || { id, name: id }
  })

  const isTagSelected = (tagId: string) => selectedTags.includes(tagId)

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-wrap gap-1 p-2 min-h-10 items-center border border-input rounded-md bg-background">
          {selectedTagObjects.length > 0 ? (
            <>
              {selectedTagObjects.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="py-1 px-2 flex items-center gap-1"
                >
                  {tag.name}
                  <XIcon
                    size={14}
                    className="cursor-pointer opacity-70 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(tag.id)
                    }}
                  />
                </Badge>
              ))}
            </>
          ) : (
            <span className="text-muted-foreground text-sm px-2">
              {placeholder}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 p-1 ml-auto"
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
            <PlusCircleIcon size={16} />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create..."
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {createable ? (
                <div className="py-2 px-1">
                  <p className="text-sm text-muted-foreground">No tags found</p>
                  {showCreateOption && (
                    <div
                      className="flex items-center gap-2 p-2 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      onClick={handleCreateTag}
                    >
                      <PlusCircleIcon size={16} />
                      <span>Create "{inputValue}"</span>
                    </div>
                  )}
                </div>
              ) : (
                'No tags found'
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag.id}
                  value={tag.name}
                  onSelect={() => handleSelect(tag.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <CheckIcon
                      size={16}
                      className={cn(
                        isTagSelected(tag.id) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <span>{tag.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && createable && (
              <CommandGroup>
                <CommandItem onSelect={handleCreateTag}>
                  <div className="flex items-center gap-2">
                    <PlusCircleIcon size={16} />
                    <span>Create "{inputValue}"</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
