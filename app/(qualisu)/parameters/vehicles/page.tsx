import { VehiclesColumn } from '@/app/(qualisu)/parameters/vehicles/columns'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'
import VehicleClient from './client'

const VehiclesPage = async () => {
  const data = await getVehicles()

  return <VehicleClient data={data as unknown as VehiclesColumn[]} />
}

export default VehiclesPage
