import { getVehicleGroupById } from '@/features/parameters/groups/api/server-actions'
import {
  FormValues,
  VehicleGroupForm
} from '@/features/parameters/groups/components/group-form'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const vehicleGroup = await getVehicleGroupById(searchParams.id ?? '')

  return (
    <div className="px-2">
      <VehicleGroupForm
        defaultValues={vehicleGroup as FormValues}
        id={searchParams.id}
      />
    </div>
  )
}
