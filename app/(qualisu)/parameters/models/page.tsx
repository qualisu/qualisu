import ModelClient from '@/app/(qualisu)/parameters/models/client'
import { VehicleModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
import { getModels } from '@/features/parameters/models/api/server-actions'

const VehicleModelsPage = async () => {
  const data = await getModels()

  return <ModelClient data={data as unknown as VehicleModelsColumn[]} />
}

export default VehicleModelsPage
