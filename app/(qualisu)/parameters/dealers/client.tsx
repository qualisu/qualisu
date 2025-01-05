'use client'

import { useRouter } from 'next/navigation'
import { MapPin, PlusIcon } from 'lucide-react'

import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { deleteDealer } from '@/features/parameters/dealers/api/server-actions'
import {
  columns,
  DealersColumn
} from '@/app/(qualisu)/parameters/dealers/dealers-columns'

interface DealersClientProps {
  id?: string
  dealers: DealersColumn[]
}

const DealersClient = ({ id, dealers }: DealersClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteDealer(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Dealers"
          description="Manage your dealers"
          icon={<MapPin />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/dealers/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={dealers}
        filterKey="code"
        onDelete={handleDelete}
      />
    </div>
  )
}

export default DealersClient
