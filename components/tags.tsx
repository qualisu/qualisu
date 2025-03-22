'use client'

import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { CheckIcon } from '@radix-ui/react-icons'
import { PlusCircleIcon, XIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { createTag } from '@/features/questions/api/server-actions'
import * as React from 'react'

export interface Tag {
  id: string
  name: string
}

export interface SubCategory {
  id: string
  name: string
}

interface TagsProps {
  availableTags: Tag[]
  allTags?: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  selectedSubCategoryId?: string
  subcategories: SubCategory[]
  placeholder?: string
  disabled?: boolean
  maxTags?: number
}

export function TagsInput({
  availableTags = [],
  allTags = [],
  selectedTags = [],
  onTagsChange,
  selectedSubCategoryId,
  subcategories = [],
  placeholder = 'Etiketleri seçin...',
  disabled = false,
  maxTags = Infinity
}: TagsProps) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)
  const [showSubCategoryModal, setShowSubCategoryModal] = React.useState(false)
  const [selectedSubCategories, setSelectedSubCategories] = React.useState<
    string[]
  >(selectedSubCategoryId ? [selectedSubCategoryId] : [])
  const [tempSelectedSubCategories, setTempSelectedSubCategories] =
    React.useState<string[]>([])
  const [tagToCreate, setTagToCreate] = React.useState<string>('')
  const [subCategorySearchQuery, setSubCategorySearchQuery] = React.useState('')

  // Reset temp selections when modal opens/closes
  React.useEffect(() => {
    if (showSubCategoryModal) {
      // When modal opens, initialize temp selections with current selections
      setTempSelectedSubCategories(selectedSubCategories)
    } else {
      // When modal closes without confirming, clear the search query
      setSubCategorySearchQuery('')
    }
  }, [showSubCategoryModal, selectedSubCategories])

  const handleSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter((id) => id !== tagId))
    } else {
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tagId])
      }
    }
    setOpen(false)
    setInputValue('')
  }

  const handleRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return

    // Check if subcategory is selected
    if (selectedSubCategories.length === 0 && !selectedSubCategoryId) {
      // If no subcategory is selected at all, show the modal
      setTagToCreate(inputValue)
      setShowSubCategoryModal(true)
      return
    }

    // If we have a selectedSubCategoryId but it's not in selectedSubCategories, add it
    const subCategoryIds =
      selectedSubCategories.length > 0
        ? selectedSubCategories
        : selectedSubCategoryId
        ? [selectedSubCategoryId]
        : []

    await createTagWithSubCategories(inputValue, subCategoryIds)
    setOpen(false) // Close the popover after creating a tag
  }

  const createTagWithSubCategories = async (
    tagName: string,
    subCategoryIds: string[]
  ) => {
    if (!tagName.trim() || subCategoryIds.length === 0) return

    // Check if tag already exists - with null check
    const existingTag = availableTags?.find(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
    )

    if (existingTag) {
      // If it exists but isn't selected, select it
      if (!selectedTags.includes(existingTag.id)) {
        handleSelect(existingTag.id)
      } else {
        setOpen(false) // Close the popover if the tag is already selected
      }
    } else {
      try {
        setIsCreating(true)
        // Create new tag on the server
        const newTag = await createTag({
          name: tagName,
          failureSubCategoryIds: subCategoryIds
        })

        // Add the new tag to selected tags
        onTagsChange([...selectedTags, newTag.id])

        toast({
          title: 'Etiket Eklendi',
          description: `"${newTag.name}" etiketi başarıyla oluşturuldu.`
        })

        setOpen(false) // Close the popover after creating a tag
      } catch (error) {
        console.error('Error creating tag:', error)
        toast({
          title: 'Hata',
          description: 'Etiket oluşturulurken bir hata oluştu.',
          variant: 'destructive'
        })
      } finally {
        setIsCreating(false)
        setInputValue('')
        setTagToCreate('')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault()
      handleCreateTag()
    }
  }

  // Get all selected tag objects
  const selectedTagObjects = selectedTags.map((id) => {
    // First check in availableTags
    const existingTag = availableTags.find((tag) => tag.id === id)

    // If not found in availableTags, check in allTags
    if (!existingTag && allTags.length > 0) {
      const tagFromAll = allTags.find((tag) => tag.id === id)
      if (tagFromAll) {
        return tagFromAll
      }
    }

    // If the tag doesn't exist in any list, display a more user-friendly message
    return existingTag || { id, name: `Etiket (${id.substring(0, 8)})` }
  })

  const isTagSelected = (tagId: string) => selectedTags.includes(tagId)

  // Filter tags based on selected subcategory and input value
  const filteredTags = (availableTags || []).filter((tag) => {
    const matchesInput = tag.name
      .toLowerCase()
      .includes(inputValue.toLowerCase())

    // If no subcategory is selected or we're in the dropdown, show all tags that match the input
    if (!selectedSubCategoryId || open) {
      return matchesInput
    }

    // Otherwise, only show tags that belong to the selected subcategory
    // This would require additional data about which tags belong to which subcategories
    // For now, we'll just filter by input value
    return matchesInput
  })

  const handleSubCategorySelect = (subCategoryId: string) => {
    setTempSelectedSubCategories((prev) => {
      if (prev.includes(subCategoryId)) {
        return prev.filter((id) => id !== subCategoryId)
      } else {
        return [...prev, subCategoryId]
      }
    })
  }

  const handleConfirmSubCategories = () => {
    if (tempSelectedSubCategories.length > 0 && tagToCreate) {
      // Only update the actual selections when confirmed
      setSelectedSubCategories(tempSelectedSubCategories)
      createTagWithSubCategories(tagToCreate, tempSelectedSubCategories)
      setShowSubCategoryModal(false)
      setSubCategorySearchQuery('')
    } else {
      toast({
        title: 'Alt Kategori Gerekli',
        description: 'En az bir alt kategori seçmelisiniz.',
        variant: 'destructive'
      })
    }
  }

  // Filter subcategories based on search query
  const filteredSubcategories = subcategories.filter((subcategory) =>
    subcategory.name
      .toLowerCase()
      .includes(subCategorySearchQuery.toLowerCase())
  )

  const showCreateOption = inputValue.trim().length > 0

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex flex-wrap gap-1.5 px-3 py-2 min-h-10 items-center border border-input rounded-md bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:border-muted-foreground/50 transition-colors">
            {selectedTagObjects.length > 0 ? (
              <>
                {selectedTagObjects.map((tag, index) => {
                  // Generate a pastel color based on the tag id for consistency
                  const colorIndex =
                    tag.id
                      .split('')
                      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6
                  const pastelColors = [
                    'bg-blue-100 text-blue-800 border-blue-200',
                    'bg-green-100 text-green-800 border-green-200',
                    'bg-purple-100 text-purple-800 border-purple-200',
                    'bg-yellow-100 text-yellow-800 border-yellow-200',
                    'bg-pink-100 text-pink-800 border-pink-200',
                    'bg-indigo-100 text-indigo-800 border-indigo-200'
                  ]

                  return (
                    <Badge
                      key={tag.id}
                      className={cn(
                        'py-1 px-2 flex items-center gap-1 border hover:bg-white dark:hover:bg-opacity-70',
                        pastelColors[colorIndex]
                      )}
                    >
                      <span>{tag.name}</span>
                      <div className="flex items-center justify-center ml-1">
                        <XIcon
                          size={14}
                          className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(tag.id)
                          }}
                        />
                      </div>
                    </Badge>
                  )
                })}
              </>
            ) : (
              <span className="text-muted-foreground text-sm w-full truncate opacity-70">
                {placeholder}
              </span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Ara veya yeni oluştur..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
            />
            {!selectedSubCategoryId && showCreateOption && (
              <div className="p-2 border-b border-border flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400">
                <AlertCircle size={16} />
                <span>Etiket eklemek için alt kategori seçin</span>
              </div>
            )}
            <CommandList>
              <CommandEmpty>
                <div className="py-2 px-1">
                  <p className="text-sm text-muted-foreground">
                    Etiket bulunamadı
                  </p>
                  {showCreateOption && selectedSubCategoryId && (
                    <Button
                      onClick={handleCreateTag}
                      className="w-full mt-2 bg-indigo-500 hover:bg-indigo-600"
                      disabled={isCreating}
                    >
                      <PlusCircleIcon className="mr-2 h-4 w-4" />"{inputValue}"
                      ekle
                    </Button>
                  )}
                </div>
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
                        className={cn(
                          'h-4 w-4',
                          isTagSelected(tag.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span>{tag.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Subcategory Selection Modal */}
      <Dialog
        open={showSubCategoryModal}
        onOpenChange={(open) => {
          if (!open) {
            // When closing the modal without confirming, reset the temp selections
            setTempSelectedSubCategories([])
            setSubCategorySearchQuery('')
          }
          setShowSubCategoryModal(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Alt Kategori Seçin
            </DialogTitle>
            <DialogDescription>
              "{tagToCreate}" etiketini eklemek için bir veya daha fazla alt
              kategori seçin.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Search input for subcategories */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Alt kategorilerde ara..."
                  value={subCategorySearchQuery}
                  onChange={(e) => setSubCategorySearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-8"
                />
                {subCategorySearchQuery && (
                  <button
                    onClick={() => setSubCategorySearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
              {filteredSubcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg cursor-pointer border transition-all duration-200 hover:scale-[1.02]',
                    tempSelectedSubCategories.includes(subcategory.id)
                      ? 'bg-primary/5 border-primary shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-accent/50'
                  )}
                  onClick={() => handleSubCategorySelect(subcategory.id)}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-5 h-5 rounded-full border',
                      tempSelectedSubCategories.includes(subcategory.id)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    )}
                  >
                    {tempSelectedSubCategories.includes(subcategory.id) && (
                      <CheckIcon className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {subcategory.name}
                  </span>
                </div>
              ))}
            </div>

            {filteredSubcategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">
                  {subCategorySearchQuery
                    ? `"${subCategorySearchQuery}" ile eşleşen alt kategori bulunamadı`
                    : 'Henüz alt kategori bulunmuyor'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subCategorySearchQuery
                    ? 'Lütfen farklı bir arama terimi deneyin'
                    : 'Lütfen önce alt kategorileri ekleyin'}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <p>
                Seçilen:{' '}
                <span className="font-medium text-foreground">
                  {tempSelectedSubCategories.length}
                </span>
              </p>
              {tempSelectedSubCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempSelectedSubCategories([])}
                  className="h-8 px-2"
                >
                  Tümünü Temizle
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center gap-2 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowSubCategoryModal(false)
                setTempSelectedSubCategories([])
              }}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button
              onClick={handleConfirmSubCategories}
              disabled={tempSelectedSubCategories.length === 0}
              className="w-full sm:w-auto"
            >
              <CheckIcon className="mr-2 h-4 w-4" />
              Onayla ve Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
