import ModelClient from '@/app/(qualisu)/parameters/models/client'
import { ModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
import { getModels } from '@/features/parameters/models/api/server-actions'

const VehicleModelsPage = async () => {
  const data = await getModels()

  return <ModelClient data={data as unknown as ModelsColumn[]} />
}

export default VehicleModelsPage
