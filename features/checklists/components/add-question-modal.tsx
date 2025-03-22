'use client'

import { useState, useEffect, useMemo } from 'react'
import { QuestionCatalog, ChecklistTypes } from '@prisma/client'
import { ArrowUpDown, Plus } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'

export interface QuestionWithCategory extends QuestionCatalog {
  subCategory: {
    name: string
    mainCategory: { name: string }
  }
  isOldVersion: boolean
  hasNewVersion: boolean
}

interface AddQuestionModalProps {
  questions: QuestionWithCategory[]
  selectedQuestions: string[]
  selectedType: ChecklistTypes
  onQuestionsChange: (questions: string[]) => void
  checklistQuestions?: Array<{
    questionId: string
    version: number
    question: QuestionCatalog
  }>
}

const addQuestionColumns: ColumnDef<QuestionWithCategory>[] = [
  {
    id: 'select',
    header: ({ table }) => null,
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="translate-y-[2px]"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return (
        <p>
          {row.original.type.charAt(0).toUpperCase() +
            row.original.type.slice(1).toLowerCase()}
        </p>
      )
    }
  },
  {
    accessorKey: 'grade',
    header: 'Grade'
  },
  {
    accessorKey: 'subCategoryName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Question Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    accessorFn: (row) =>
      `${row.subCategory.mainCategory.name} / ${row.subCategory.name}`,
    cell: ({ row }) => {
      const subCategory = row.original.subCategory
      return (
        <p className="px-4">
          {subCategory?.mainCategory.name} / {subCategory?.name}
        </p>
      )
    },
    enableColumnFilter: true,
    filterFn: (row, id, filterValue: string[]) => {
      const value = `${row.original.subCategory.mainCategory.name} / ${row.original.subCategory.name}`
      return !filterValue.length || filterValue.includes(value)
    }
  }
]

export default function AddQuestionModal({
  questions,
  selectedQuestions,
  selectedType,
  onQuestionsChange,
  checklistQuestions = []
}: AddQuestionModalProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({})

  // Combine current questions with checklist questions
  const allQuestions = useMemo(() => {
    // Create a map of current questions for easy lookup
    const currentQuestionsMap = new Map(
      questions.map((q) => [q.id, { ...q, hasNewVersion: false }])
    )

    // Group questions by questionId to find different versions
    const questionGroups = new Map<
      string,
      { current: QuestionWithCategory; old: QuestionWithCategory[] }
    >()

    // First, add all current catalog questions
    questions.forEach((q) => {
      if (!questionGroups.has(q.id)) {
        questionGroups.set(q.id, {
          current: q as QuestionWithCategory,
          old: []
        })
      }
    })

    // Then check checklist questions for old versions
    checklistQuestions.forEach((cq) => {
      const group = questionGroups.get(cq.questionId)
      if (group && cq.version < group.current.version) {
        // This is an old version
        group.old.push({
          ...cq.question,
          id: cq.questionId,
          version: cq.version,
          isOldVersion: true,
          hasNewVersion: true
        } as QuestionWithCategory)

        // Mark current version as having old version
        currentQuestionsMap.set(cq.questionId, {
          ...group.current,
          hasNewVersion: true
        })
      }
    })

    // Add all versions to the final map
    questionGroups.forEach((group, questionId) => {
      // Add current version
      currentQuestionsMap.set(questionId, group.current)

      // Add old versions
      group.old.forEach((oldVersion) => {
        currentQuestionsMap.set(
          `${questionId}_old_${oldVersion.version}`,
          oldVersion
        )
      })
    })

    return Array.from(currentQuestionsMap.values())
  }, [questions, checklistQuestions])

  // Filter questions based on type
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((question) => question.type === selectedType)
  }, [allQuestions, selectedType])

  // Reset row selection when modal opens
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      const newRowSelection: Record<number, boolean> = {}
      filteredQuestions.forEach((question, index) => {
        if (selectedQuestions.includes(question.id)) {
          newRowSelection[index] = true
        }
      })
      setRowSelection(newRowSelection)
    }
  }

  const handleSave = () => {
    // First, get all selected questions
    const selectedQuestions = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((idx) => filteredQuestions[parseInt(idx)])

    // Create a map to track questions with both versions selected
    const versionMap = new Map<string, QuestionWithCategory>()

    // Process each selected question
    selectedQuestions.forEach((question) => {
      const existingQuestion = versionMap.get(question.id)

      // If we haven't seen this question ID before, or this is a newer version
      if (
        !existingQuestion ||
        (!question.isOldVersion && existingQuestion.isOldVersion)
      ) {
        versionMap.set(question.id, question)
      }
    })

    // Convert map values back to array of IDs
    const finalSelectedIds = Array.from(versionMap.values()).map((q) => q.id)

    onQuestionsChange(finalSelectedIds)
    setOpen(false)
  }

  const columns: ColumnDef<QuestionWithCategory>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const isNewVersionSelected =
          selectedQuestions.includes(row.original.id) &&
          !row.original.isOldVersion

        return (
          <div className="flex items-center">
            <Checkbox
              checked={
                isNewVersionSelected ||
                selectedQuestions.includes(row.original.id)
              }
              onCheckedChange={(checked) => {
                const id = row.original.id
                let newSelected = [...selectedQuestions]

                if (checked) {
                  // Get base name of current question (e.g., "Question1" from "Question1.rev2")
                  const currentBaseName = row.original.name.split('.')[0]

                  // Find and remove any other version of this question
                  filteredQuestions.forEach((q, index) => {
                    const qBaseName = q.name.split('.')[0]
                    if (qBaseName === currentBaseName && q.id !== id) {
                      // Remove from selection
                      newSelected = newSelected.filter((qId) => qId !== q.id)
                      // Update checkbox state
                      const newRowSelection = { ...rowSelection }
                      newRowSelection[index] = false
                      setRowSelection(newRowSelection)
                    }
                  })

                  if (!newSelected.includes(id)) {
                    newSelected.push(id)
                  }
                } else {
                  newSelected = newSelected.filter((qId) => qId !== id)
                }

                // Update selectedQuestions
                onQuestionsChange(newSelected)

                // Sync rowSelection with selectedQuestions
                const newRowSelection = { ...rowSelection }
                filteredQuestions.forEach((question, index) => {
                  newRowSelection[index] = newSelected.includes(question.id)
                })
                setRowSelection(newRowSelection)
              }}
              aria-label="Select row"
            />
            {row.original.isOldVersion && (
              <Badge variant="outline" className="ml-2">
                Old Version
              </Badge>
            )}
            {row.original.hasNewVersion && !row.original.isOldVersion && (
              <Badge variant="outline" className="ml-2">
                New Version
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'type',
      header: 'Type'
    },
    {
      accessorKey: 'grade',
      header: 'Grade'
    },
    {
      accessorKey: 'version',
      header: 'Version'
    },
    {
      accessorKey: 'subCategory',
      header: 'Category',
      cell: ({ row }) => {
        const subCategory = row.original.subCategory
        return (
          <div className="flex items-center">
            {subCategory?.mainCategory.name} / {subCategory?.name}
          </div>
        )
      }
    }
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Questions</DialogTitle>
          <DialogDescription>
            Select questions to add to your checklist
          </DialogDescription>
        </DialogHeader>
        <DataTable<QuestionWithCategory, string>
          columns={columns}
          data={filteredQuestions}
          filterKey="name"
          isAdd={false}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          facetedFilters={[
            {
              column: 'subCategoryName',
              title: 'Category',
              options: Array.from(
                new Map(
                  filteredQuestions.map((question) => [
                    `${question.subCategory.mainCategory.name} / ${question.subCategory.name}`,
                    {
                      label: `${question.subCategory.mainCategory.name} / ${question.subCategory.name}`,
                      value: `${question.subCategory.mainCategory.name} / ${question.subCategory.name}`
                    }
                  ])
                )
              ).map(([_, value]) => value)
            }
          ]}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save ({Object.values(rowSelection).filter(Boolean).length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
