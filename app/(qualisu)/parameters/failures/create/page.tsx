import PointForm from '@/features/parameters/points/components/point-form'
import { getFailureById } from '@/features/parameters/failures/api/server-actions'
import { FailuresColumn } from '@/app/(qualisu)/parameters/failures/columns'
import FailureForm from '@/features/parameters/failures/components/failure-form'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const failure = await getFailureById(searchParams.id ?? '')

  return (
    <div className="px-2">
      <FailureForm
        initialData={failure as FailuresColumn}
        id={searchParams.id}
      />
    </div>
  )
}
