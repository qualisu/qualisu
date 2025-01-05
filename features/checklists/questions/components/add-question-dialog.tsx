import { Button } from '@/components/ui/button'
import { QuestionsColumn } from '@/app/(qualisu)/checklists/questions/questions-columns'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface Props {
  questions: QuestionsColumn[]
  isOpen: boolean
  onClose: () => void
  activeQuestions: QuestionsColumn[]
  onQuestionsSelected: (selectedQuestions: QuestionsColumn[]) => void
  id?: string
  checklistTypesId: string
  currentSelectedQuestions?: QuestionsColumn[]
}

const AddQuestionDialog = ({
  questions,
  isOpen,
  onClose,
  activeQuestions,
  onQuestionsSelected,
  id,
  checklistTypesId,
  currentSelectedQuestions = []
}: Props) => {
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionsColumn[]>(
    []
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredQuestions, setFilteredQuestions] =
    useState<QuestionsColumn[]>(questions)

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setFilteredQuestions(questions)

      // Initialize with current selected questions if they exist
      if (currentSelectedQuestions && currentSelectedQuestions.length > 0) {
        setSelectedQuestions(currentSelectedQuestions)
      } else if (id && activeQuestions.length > 0) {
        // If in edit mode and there are active questions
        const initialSelected = activeQuestions.filter((question) =>
          question.checklistTypes.some((type) => type.id === checklistTypesId)
        )
        setSelectedQuestions(initialSelected)
      } else {
        // New addition or no questions
        setSelectedQuestions([])
      }
    }
  }, [
    isOpen,
    activeQuestions,
    checklistTypesId,
    questions,
    currentSelectedQuestions,
    id
  ])

  useEffect(() => {
    const filtered = questions.filter(
      (question) =>
        question.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredQuestions(filtered)
  }, [questions, searchTerm])

  const handleQuestionToggle = (
    question: QuestionsColumn,
    checked: boolean
  ) => {
    setSelectedQuestions((prev) => {
      if (checked) {
        return [...prev, question]
      } else {
        return prev.filter((q) => q.id !== question.id)
      }
    })
  }

  const handleSubmit = () => {
    if (selectedQuestions.length === 0) {
      return
    }
    onQuestionsSelected(selectedQuestions)
    onClose()
  }

  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredQuestions(questions)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-[1800px]">
        <DialogHeader className="px-2 py-4 border-b">
          <DialogTitle>Soru Seç</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex items-center justify-center mt-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Soru ara..."
              className="pl-8 pr-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <ScrollArea className="my-4 h-[300px]">
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={question.id}
                  onCheckedChange={(checked) =>
                    handleQuestionToggle(question, checked as boolean)
                  }
                  checked={selectedQuestions.some((q) => q.id === question.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={question.id}
                    className="text-sm font-medium leading-none block"
                  >
                    {question.name}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {question.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex items-center justify-between gap-2 p-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {selectedQuestions.length} Question {id ? 'Update' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddQuestionDialog
