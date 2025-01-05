'use client'

import * as React from 'react'
import { forwardRef, useMemo } from 'react'

import {
  Circle,
  CircleCheck,
  CircleSlash,
  CircleX,
  Save,
  Trash2
} from 'lucide-react'
import { QuestionsColumn } from '../../checklists/questions/questions-columns'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AnswerFormValues } from './answer-form'

interface QuestionBarProps {
  questions: QuestionsColumn[]
  onQuestionSelect: (question: QuestionsColumn) => void
  answers: Record<string, AnswerFormValues>
  onSubmit: () => void
  isValid: boolean
  isSubmitting: boolean
  currentQuestionIndex: number
}

const QuestionBar = forwardRef<
  { updateSelectedQuestion: (questionId: string) => void },
  QuestionBarProps
>(
  (
    {
      questions,
      onQuestionSelect,
      answers,
      onSubmit,
      isValid,
      isSubmitting,
      currentQuestionIndex
    },
    ref
  ) => {
    const [selectedQuestionId, setSelectedQuestionId] = React.useState<
      string | null
    >(questions.length > 0 ? questions[0].id : null)

    React.useEffect(() => {
      if (questions.length > 0) {
        handleQuestionClick(questions[0])
      }
    }, [questions])

    const groupedQuestions = useMemo(() => {
      return questions.reduce((acc, question) => {
        if (!acc[question.category]) {
          acc[question.category] = {}
        }
        if (!acc[question.category][question.subCategory]) {
          acc[question.category][question.subCategory] = []
        }
        acc[question.category][question.subCategory].push(question)
        return acc
      }, {} as Record<string, Record<string, QuestionsColumn[]>>)
    }, [questions])

    const handleQuestionClick = (question: QuestionsColumn) => {
      setSelectedQuestionId(question.id)
      onQuestionSelect(question)
    }

    React.useImperativeHandle(ref, () => ({
      updateSelectedQuestion: setSelectedQuestionId
    }))

    const QuestionItem = ({ question }: { question: QuestionsColumn }) => {
      const answer = answers[question.id]?.answer

      return (
        <div
          key={question.id}
          className={`flex flex-col gap-2 mb-2 ml-2 cursor-pointer p-2 rounded-md ${
            selectedQuestionId === question.id
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
          }`}
          onClick={() => handleQuestionClick(question)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-2">
            {answer === 'ok' ? (
              <CircleCheck className="w-4 h-4 text-green-500" />
            ) : answer === 'nok' ? (
              <CircleX className="w-4 h-4 text-red-500" />
            ) : answer === 'na' || answer === 'sk' ? (
              <CircleSlash className="w-4 h-4 text-orange-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="truncate">{question.name}</div>
          </div>
        </div>
      )
    }

    const isLastQuestion = currentQuestionIndex === questions.length - 1

    return (
      <div className="h-full">
        <div className="relative">
          <h1 className="text-2xl font-bold mb-4">Kontrol Listesi</h1>
          {Object.entries(groupedQuestions).map(
            ([category, subCategories], categoryIndex) => (
              <div key={category} className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                  {categoryIndex + 1}. {category}
                </h2>
                {Object.entries(subCategories).map(
                  ([subCategory, questions], subCategoryIndex) => (
                    <div key={`${category}-${subCategory}`}>
                      {category !== subCategory && (
                        <h3 className="text-sm text-muted-foreground ml-2 mb-2">
                          {categoryIndex + 1}.{subCategoryIndex + 1}.{' '}
                          {subCategory}
                        </h3>
                      )}
                      {questions.map((question, questionIndex) => (
                        <QuestionItem key={question.id} question={question} />
                      ))}
                    </div>
                  )
                )}
              </div>
            )
          )}
        </div>
        <div className="sticky bottom-0 bg-background">
          <Separator className="mb-2" />
          <div className="flex gap-2">
            <Button className="flex gap-2 bg-red-400/10 text-red-500 border-red-400 border hover:bg-red-500/20">
              <Trash2 className="w-4 h-4" />
              <span className="md:block hidden font-light">Clear</span>
            </Button>
            <Button
              type="button"
              className="flex gap-2 bg-red-500 text-white border-red-400 border hover:bg-red-400/80"
              onClick={onSubmit}
              disabled={!isLastQuestion || !isValid || isSubmitting}
            >
              <Save className="w-4 h-4" />
              <span className="md:block hidden font-light">Submit</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

QuestionBar.displayName = 'QuestionBar'

export default QuestionBar
