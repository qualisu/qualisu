'use client'

import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { BadgeAlert, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { columns, FailuresColumn } from './columns'
import { deleteFailure } from '@/features/parameters/failures/api/server-actions'

interface FailuresClientProps {
  id?: string
  data: FailuresColumn[]
}

const FailuresClient = ({ data, id }: FailuresClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteFailure(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Failures"
          description="Manage your failures"
          icon={<BadgeAlert />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/parameters/failures/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterKey="code"
        onDelete={handleDelete}
      />
    </div>
  )
}

export default FailuresClient
