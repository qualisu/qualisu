import {
  getChecklistById,
  getQuestions
} from '@/features/checklists/questions/api/server-actions'
import ChecklistForm from '@/features/checklists/questions/components/checklist-form'
import { getDealers } from '@/features/parameters/dealers/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModels } from '@/features/parameters/models/api/server-actions'
import { getPoints } from '@/features/parameters/points/api/server-actions'

interface Props {
  searchParams: {
    id?: string
  }
}

export default async function CreatePage({ searchParams }: Props) {
  const checklist = await getChecklistById(searchParams.id ?? '')
  const points = await getPoints()
  const groups = await getGroups()
  const models = await getModels()
  const questions = await getQuestions()

  return (
    <div className="px-2">
      <ChecklistForm
        initialData={checklist as any}
        points={points as any}
        groups={groups as any}
        models={models as any}
        questions={questions as any}
      />
    </div>
  )
}
