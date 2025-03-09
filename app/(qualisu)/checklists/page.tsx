// checklists/page.tsx

import ChecklistStepsPage from '@/app/(qualisu)/checklists/client'

import { getPoints } from '@/features/parameters/points/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModels } from '@/features/parameters/models/api/server-actions'
import { getChecklistById } from '@/features/checklists/api/server-actions'
import { getQuestionCatalog } from '@/features/questions/api/server-actions'
import {
  Checklists,
  QuestionCatalog,
  VehicleModel,
  VehicleGroup,
  Points
} from '@prisma/client'

interface Props {
  searchParams: { id?: string }
}

export default async function ChecklistPage({ searchParams }: Props) {
  const checklist = await getChecklistById(searchParams.id ?? '')
  const points = await getPoints()
  const groups = await getGroups()
  const models = await getModels()
  let questions = await getQuestionCatalog()

  // Add questions from checklist that might not be in the catalog
  if (checklist && 'questions' in checklist) {
    const checklistQuestions = (checklist.questions as any[])
      .filter(
        (q) => q.question && !questions.some((catQ) => catQ.id === q.questionId)
      )
      .map((q) => ({
        ...q.question,
        id: q.questionId,
        version: q.version
      }))

    questions = [...questions, ...checklistQuestions]
  }

  return (
    <div className="py-5 px-2.5">
      <ChecklistStepsPage
        checklist={checklist as Checklists}
        points={points as unknown as (Points & { groups: VehicleGroup[] })[]}
        groups={groups as unknown as VehicleGroup[]}
        models={models as unknown as VehicleModel[]}
        questions={
          questions as (QuestionCatalog & {
            subCategory: { name: string; mainCategory: { name: string } }
          })[]
        }
        mode={searchParams.id ? 'edit' : 'create'}
      />
    </div>
  )
}
