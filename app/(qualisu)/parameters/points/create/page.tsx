import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getPointById } from '@/features/parameters/points/api/server-actions'
import { PointsColumn } from '@/app/(qualisu)/parameters/points/columns'
import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import PointForm from '@/features/parameters/points/components/point-form'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const point = await getPointById(searchParams.id ?? '')
  const groups = await getGroups()

  return (
    <div className="px-2">
      <PointForm
        initialData={point as PointsColumn}
        groups={groups as GroupsColumn[]}
        id={searchParams.id}
      />
    </div>
  )
}
