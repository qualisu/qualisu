import PointClient from './client'
import { PointsColumn } from './columns'
import { getPoints } from '@/features/parameters/points/api/server-actions'

const PointsPage = async () => {
  const data = await getPoints()

  if (!data) {
    return <div>No data found</div>
  }

  return <PointClient data={data} />
}

export default PointsPage
