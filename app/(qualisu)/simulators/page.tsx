import { getPoints } from '@/features/parameters/points/api/server-actions'
import SimulatorClient from './client'
import NotFoundChecklists from './not-found'
import { getUsers } from '@/actions/users'

const Simulators = async () => {
  const points = await getPoints()
  const users = await getUsers()

  if (!points || !users) {
    return <NotFoundChecklists />
  }

  return <SimulatorClient users={users} />
}

export default Simulators
