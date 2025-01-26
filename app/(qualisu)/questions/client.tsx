// app/(qualisu)/questions/client.tsx

'use client'

import { useState } from 'react'
import { ChecklistTypes } from '@prisma/client'
import { BarChart2, ClipboardCheck, Factory } from 'lucide-react'

import QuestionSteps from '@/features/questions/components/question-steps'
import { SubCategoriesColumn } from '../parameters/categories/sub-category-columns'

interface QuestionStepsPageProps {
  subCategories: SubCategoriesColumn[]
}

export default function QuestionStepsPage({
  subCategories
}: QuestionStepsPageProps) {
  const [selectedOption, setSelectedOption] = useState<string>()

  const preferenceOptions = [
    {
      id: 'standard',
      title: 'Standard Control',
      description: 'Standard quality control and regulation checklists',
      icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
      types: [
        ChecklistTypes.STANDART,
        ChecklistTypes.REGULATION,
        ChecklistTypes.GENERIC
      ]
    },

    {
      id: 'complaint',
      title: 'Complaint Control',
      description: 'Complaint checklists',
      icon: <Factory className="w-6 h-6 text-primary" />,
      types: [ChecklistTypes.COMPLAINT]
    },
    {
      id: 'traceability',
      title: 'Traceability Control',
      description: 'Traceability checklists',
      icon: <BarChart2 className="w-6 h-6 text-primary" />,
      types: [ChecklistTypes.TRACING]
    },
    {
      id: 'supplier',
      title: 'Supplier Control',
      description: 'Supplier audits and tracing checklists',
      icon: <Factory className="w-6 h-6 text-primary" />,
      types: [ChecklistTypes.SUPPLIER]
    },
    {
      id: 'periodic',
      title: 'Periodic Control',
      description: 'Periodic control checklists',
      icon: <BarChart2 className="w-6 h-6 text-primary" />,
      types: [
        ChecklistTypes.PERIODIC,
        ChecklistTypes.PARTCOP,
        ChecklistTypes.COP
      ]
    }
  ]

  return (
    <QuestionSteps
      subCategories={subCategories}
      options={preferenceOptions}
      selectedOption={selectedOption}
      onSelect={setSelectedOption}
      onBack={() => console.log('Back clicked')}
    />
  )
}
