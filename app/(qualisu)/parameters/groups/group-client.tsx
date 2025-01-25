'use client'

import {
  columns,
  GroupsColumn
} from '@/app/(qualisu)/parameters/groups/columns'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { deleteVehicleGroup } from '@/features/parameters/groups/api/server-actions'
import { BusFront, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GroupClientProps {
  data: GroupsColumn[]
  id?: string
}

const GroupClient = ({ data, id }: GroupClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteVehicleGroup(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicle Groups"
          description="Manage your vehicle groups"
          icon={<BusFront />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/groups/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<GroupsColumn, any>
        columns={columns}
        data={data}
        filterKey="name"
        isAdd={false}
      />
    </div>
  )
}

export default GroupClient
