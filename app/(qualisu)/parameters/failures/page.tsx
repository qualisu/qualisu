import { getFailures } from '@/features/parameters/failures/api/server-actions'
import FailuresClient from './client'
import { FailuresColumn } from './columns'

const FailuresPage = async () => {
  const data = await getFailures()

  if (!data) {
    return <div>No data found</div>
  }

  return <FailuresClient data={data as FailuresColumn[]} />
}

export default FailuresPage
