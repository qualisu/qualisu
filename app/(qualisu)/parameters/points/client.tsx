'use client'

import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { MapPin, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { columns, PointsColumn } from './columns'
import { deletePoint } from '@/features/parameters/points/api/server-actions'

interface PointClientProps {
  id?: string
  data: PointsColumn[]
}

const PointClient = ({ data, id }: PointClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deletePoint(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Points"
          description="Manage your points"
          icon={<MapPin />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/points/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<PointsColumn, any>
        columns={columns}
        data={data}
        filterKey="name"
        isAdd={false}
      />
    </div>
  )
}

export default PointClient
