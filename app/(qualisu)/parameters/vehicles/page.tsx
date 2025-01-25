import VehiclesClient from './client'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'

const VehiclesPage = async () => {
  const vehicles = await getVehicles()

  return (
    <div className="h-full">
      <VehiclesClient vehicles={vehicles as any} />
    </div>
  )
}

export default VehiclesPage
