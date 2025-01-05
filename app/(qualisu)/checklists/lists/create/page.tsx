import {
  getChecklistById,
  getChecklistTypes,
  getQuestions
} from '@/features/checklists/questions/api/server-actions'
import { ChecklistsColumn } from '../checklists-columns'
import ChecklistForm from '@/features/checklists/questions/components/checklist-form'
import { QuestionsColumn } from '../../questions/questions-columns'
import { ChecklistTypes } from '@prisma/client'
import { getPoints } from '@/features/parameters/points/api/server-actions'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'
import { getDealers } from '@/features/parameters/dealers/api/server-actions'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModels } from '@/features/parameters/models/api/server-actions'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const checklist = (await getChecklistById(searchParams.id ?? '')) as any
  const checklistTypes = await getChecklistTypes()
  const points = (await getPoints()) as PointsColumn[]
  const questions = (await getQuestions()) as QuestionsColumn[]
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
        initialData={initialData}
        questions={questions}
        dealers={dealers}
        checklistTypes={checklistTypes as ChecklistTypes[]}
        points={points}
        id={searchParams.id}
        vehicles={
          vehicles?.map((vehicle) => ({
            id: vehicle.id,
            name: vehicle.name,
            modelId: vehicle.modelId
          })) ?? []
        }
        groups={
          groups?.map((group) => ({
            id: group.id,
            name: group.name
          })) ?? []
        }
        models={
          models?.map((model) => ({
            id: model.id,
            name: model.name,
            groupId: model.groupId
          })) ?? []
        }
      />
    </div>
  )
}
