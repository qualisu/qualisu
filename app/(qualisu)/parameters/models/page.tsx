import ModelClient from '@/app/(qualisu)/parameters/models/client'
import { getModels } from '@/features/parameters/models/api/server-actions'
import { ModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
const VehicleModelsPage = async () => {
  const data = await getModels()

  return <ModelClient data={data as ModelsColumn[]} />
}

export default VehicleModelsPage
