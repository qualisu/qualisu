// app/(qualisu)/checklists/client.tsx

'use client'

import React from 'react'
import { useState, useMemo } from 'react'
import {
  Checklists,
  ChecklistTypes,
  Points,
  VehicleModel,
  VehicleGroup,
  QuestionCatalog,
  Vehicles,
  Dealers
} from '@prisma/client'
import { BarChart2, ClipboardCheck, Factory } from 'lucide-react'
import ChecklistSteps from '@/features/checklists/components/checklist-steps'
import ChecklistForm from '@/features/checklists/components/checklist-form'

interface ChecklistOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  type: ChecklistTypes
}

interface ChecklistStepsPageProps {
  checklist?: Checklists
  points?: Points[]
  groups?: VehicleGroup[]
  models?: VehicleModel[]
  mode?: 'create' | 'edit'
  questions?: (QuestionCatalog & {
    subCategory: { name: string; mainCategory: { name: string } }
  })[]
}

const MemoizedChecklistForm = React.memo(ChecklistForm)
const MemoizedChecklistSteps = React.memo(ChecklistSteps)

export default function ChecklistStepsPage({
  checklist,
  points,
  groups,
  models,
  mode,
  questions
}: ChecklistStepsPageProps) {
  const [selectedOption, setSelectedOption] = useState<string>()

  const preferenceOptions = useMemo(
    () =>
      [
        {
          id: 'standard',
          title: 'Standard Checklist',
          description: 'Standard checklists',
          icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.STANDART
        },
        {
          id: 'regulation',
          title: 'Regulation Checklist',
          description: 'Regulation checklists',
          icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.REGULATION
        },
        {
          id: 'generic',
          title: 'Generic Checklist',
          description: 'Generic checklists',
          icon: <ClipboardCheck className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.GENERIC
        },
        {
          id: 'traceability',
          title: 'Traceability Checklist',
          description: 'Traceability checklists',
          icon: <BarChart2 className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.TRACING
        },
        {
          id: 'supplier',
          title: 'Supplier Checklist',
          description: 'Supplier audits and tracing checklists',
          icon: <Factory className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.SUPPLIER
        },
        {
          id: 'periodic',
          title: 'Periodic Checklist',
          description: 'Periodic checklists',
          icon: <BarChart2 className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.PERIODIC
        },
        {
          id: 'partcop',
          title: 'PartCop Checklist',
          description: 'PartCop checklists',
          icon: <Factory className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.PARTCOP
        },
        {
          id: 'cop',
          title: 'COP Checklist',
          description: 'COP checklists',
          icon: <Factory className="w-6 h-6 text-primary" />,
          type: ChecklistTypes.COP
        }
      ] as ChecklistOption[],
    []
  )

  if (mode === 'edit') {
    const filteredChecklistTypes = checklist?.type
      ? [checklist.type as ChecklistTypes]
      : preferenceOptions.flatMap((opt) => opt.type)

    return (
      <MemoizedChecklistForm
        mode={mode}
        checklist={
          checklist as unknown as Checklists & {
            groups: VehicleGroup[]
            models: VehicleModel[]
            vehicles: Vehicles[]
            questions: {
              questionId: string
              version: number
              question: QuestionCatalog & {
                subCategory: { name: string; mainCategory: { name: string } }
              }
            }[]
            dealers: Dealers[]
            points: Array<{ id: string; name: string; status: string }>
          }
        }
        checklistTypes={filteredChecklistTypes}
        uploadedFiles={{ images: [], docs: [] }}
        points={points as (Points & { groups: VehicleGroup[] })[]}
        groups={groups as VehicleGroup[]}
        models={models as VehicleModel[]}
        questions={
          questions as (QuestionCatalog & {
            subCategory: { name: string; mainCategory: { name: string } }
          })[]
        }
      />
    )
  }

  return (
    <MemoizedChecklistSteps
      options={preferenceOptions}
      selectedOption={selectedOption}
      onSelect={setSelectedOption}
      checklist={checklist}
      points={points as Points[]}
      groups={groups}
      models={models}
      questions={
        questions as (QuestionCatalog & {
          subCategory: { name: string; mainCategory: { name: string } }
        })[]
      }
    />
  )
}
