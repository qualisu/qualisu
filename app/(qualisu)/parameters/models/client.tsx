'use client'

import {
  columns,
  VehicleModelsColumn
} from '@/app/(qualisu)/parameters/models/columns'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { BusFront, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteModel } from '@/features/parameters/models/api/server-actions'

interface ModelClientProps {
  data: VehicleModelsColumn[]
  id?: string
}

const ModelClient = ({ data, id }: ModelClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteModel(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicle Models"
          description="Manage your vehicle models"
          icon={<BusFront />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/models/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterKey="name"
        onDelete={handleDelete}
      />
    </div>
  )
}

export default ModelClient
