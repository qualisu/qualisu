'use client'

import {
  columns,
  VehiclesColumn
} from '@/app/(qualisu)/parameters/vehicles/columns'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { BusFront, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteVehicle } from '@/features/parameters/vehicles/api/server-actions'

interface VehicleClientProps {
  id?: string
  data: VehiclesColumn[]
}

const VehicleClient = ({ data, id }: VehicleClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteVehicle(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicles"
          description="Manage your vehicles"
          icon={<BusFront />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/vehicles/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<VehiclesColumn, any>
        columns={columns}
        data={data}
        filterKey="name"
        isAdd={false}
      />
    </div>
  )
}

export default VehicleClient
