import PointClient from './client'
import { getPoints } from '@/features/parameters/points/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'

const PointsPage = async () => {
  const [points, groups] = await Promise.all([getPoints(), getGroups()])

  if (!points || !groups) {
    return <div>No data found</div>
  }

  return <PointClient data={points} />
}

export default PointsPage
