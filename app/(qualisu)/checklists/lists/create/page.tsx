import {
  getChecklistById,
  getChecklistTypes,
  getQuestions
} from '@/features/checklists/questions/api/server-actions'
import ChecklistForm from '@/features/checklists/questions/components/checklist-form'
import { ChecklistTypes } from '@prisma/client'
import { getPoints } from '@/features/parameters/points/api/server-actions'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'
import { getDealers } from '@/features/parameters/dealers/api/server-actions'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModels } from '@/features/parameters/models/api/server-actions'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'

import { QuestionsColumn } from '../../questions/questions-columns'
import { VehiclesColumn } from '@/app/(qualisu)/parameters/vehicles/columns'
import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import { ModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const checklist = (await getChecklistById(searchParams.id ?? '')) as any
  const checklistTypes = await getChecklistTypes()
  const points = await getPoints()
  const questions = await getQuestions()
  const dealers = (await getDealers()) as DealersColumn[]
  const vehicles = await getVehicles()
  const groups = await getGroups()
  const models = await getModels()

  if (!checklist) {
    return <div>No data found</div>
  }

  const initialData = {
    id: checklist.id ?? '',
    itemNo: checklist.itemNo ?? [],
    vehicles:
      checklist.vehicles?.map((v: any) => ({ id: v.id, name: v.name })) ?? [],
    groups:
      checklist.groups?.map((g: any) => ({ id: g.id, name: g.name })) ?? [],
    models:
      checklist.models?.map((m: any) => ({ id: m.id, name: m.name })) ?? [],
    questions: checklist.questions,
    points: checklist.points,
    dealers: dealers
      .filter((d) => checklist.dealers?.includes(d.id))
      .map((d) => ({ id: d.id, name: d.name })),
    checklistTypesId: checklist.checklistTypesId ?? '',
    dateStart: checklist.dateStart ?? undefined,
    dateEnd: checklist.dateEnd ?? undefined
  }

  return (
    <div className="px-2">
      <ChecklistForm
        initialData={initialData as any}
        questions={questions as QuestionsColumn[]}
        dealers={dealers as DealersColumn[]}
        checklistTypes={checklistTypes as ChecklistTypes[]}
        points={points as PointsColumn[]}
        id={searchParams.id}
        vehicles={vehicles as any}
        groups={groups as any}
        models={models as any}
      />
    </div>
  )
}
