import { getPoints } from '@/features/parameters/points/api/server-actions'
import SimulatorClient from './SimulatorClient'
import NotFoundChecklists from './not-found'
import { getUser } from '@/actions/auth'

const Simulators = async () => {
  const points = await getPoints()
  const user = await getUser()

  if (!points || !user) {
    return <NotFoundChecklists />
  }

  return <SimulatorClient user={user} />
}

export default Simulators
