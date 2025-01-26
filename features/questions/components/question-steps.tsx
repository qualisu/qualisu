'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import QuestionForm from './question-form'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'

interface QuestionOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  types: string[]
}

interface QuestionStepsProps {
  options: QuestionOption[]
  subCategories: SubCategoriesColumn[]
  selectedOption?: string
  onSelect: (id: string) => void
  onBack?: () => void
  currentStep?: number
  totalSteps?: number
}

export default function QuestionSteps({
  options,
  subCategories,
  selectedOption,
  onSelect,
  onBack,
  currentStep = 1,
  totalSteps = 4
}: QuestionStepsProps) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    const selectedTypes =
      options.find((opt) => opt.id === selectedOption)?.types || []
    return (
      <QuestionForm
        subCategories={subCategories}
        selectedOption={selectedOption}
        questionTypes={selectedTypes}
        onBack={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex gap-1 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              index < currentStep ? 'bg-indigo-500' : 'bg-secondary'
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => (
          <Card
            key={option.id}
            className={cn(
              'relative p-6 cursor-pointer hover:border-indigo-500 transition-colors',
              selectedOption === option.id
                ? 'border-2 border-indigo-500 bg-indigo-500/5'
                : 'border border-border'
            )}
            onClick={() => onSelect(option.id)}
          >
            {selectedOption === option.id && (
              <div className="absolute top-3 right-3">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium mb-1">{option.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-2">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="mr-2">
            Back
          </Button>
        )}
        <Button onClick={() => setShowForm(true)} disabled={!selectedOption}>
          Next
        </Button>
      </div>
    </div>
  )
}
