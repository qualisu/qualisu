import { getModels } from '@/features/parameters/models/api/server-actions'
import { getVehicleById } from '@/features/parameters/vehicles/api/server-actions'
import { VehicleForm } from '@/features/parameters/vehicles/components/vehicle-form'
import { VehiclesColumn } from '@/app/(qualisu)/parameters/vehicles/columns'
import { ModelsColumn } from '../../models/columns'
import { FormStatus } from '@prisma/client'

interface Props {
  searchParams: {
    id?: string
  }
}

const emptyVehicle: VehiclesColumn = {
  id: '',
  saseNo: '',
  warStart: new Date(),
  warEnd: new Date(),
  vehicleGroup: '',
  vehicleModel: '',
  prodDate: new Date()
}

export default async function CreatePage({ searchParams }: Props) {
  const modelsData = await getModels()
  if (!modelsData) {
    throw new Error('Failed to load models data')
  }

  // Only fetch vehicle data if we're in edit mode
  const vehicle = searchParams.id ? await getVehicleById(searchParams.id) : null

  // If we're in edit mode and vehicle is not found, throw error
  if (searchParams.id && !vehicle) {
    throw new Error('Vehicle not found')
  }

  return (
    <div className="px-2">
      <VehicleForm
        initialData={vehicle ? (vehicle as VehiclesColumn) : emptyVehicle}
        models={modelsData as ModelsColumn[]}
        mode={searchParams.id ? 'edit' : 'create'}
      />
    </div>
  )
}
