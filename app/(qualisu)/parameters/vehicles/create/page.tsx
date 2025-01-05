import { getModels } from '@/features/parameters/models/api/server-actions'
import { getVehicleById } from '@/features/parameters/vehicles/api/server-actions'
import { VehicleForm } from '@/features/parameters/vehicles/components/vehicle-form'
import { VehicleModelsColumn } from '@/app/(qualisu)/parameters/models/columns'
import { VehiclesColumn } from '@/app/(qualisu)/parameters/vehicles/columns'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const vehicle = await getVehicleById(searchParams.id ?? '')
  const models = await getModels()

  return (
    <div className="px-2">
      <VehicleForm
        initialData={vehicle as unknown as VehiclesColumn}
        models={models as unknown as VehicleModelsColumn[]}
        mode={searchParams.id ? 'edit' : 'create'}
      />
    </div>
  )
}
