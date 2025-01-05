import { getUsers } from '@/data/user'
import { getPoints } from '@/features/parameters/points/api/server-actions'
import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModels } from '@/features/parameters/models/api/server-actions'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'
import SimulatorClient from './SimulatorClient'
import NotFoundChecklists from './not-found'

const Simulators = async () => {
  const points = await getPoints()
  const users = await getUsers()
  const groups = await getGroups()
  const models = await getModels()
  const vehicles = await getVehicles()

  if (!points || !users || !groups || !models || !vehicles) {
    return <NotFoundChecklists />
  }

  return (
    <SimulatorClient
      points={points}
      users={users}
      groups={groups}
      models={models}
      vehicles={vehicles}
    />
  )
}

export default Simulators
