'use client'

import { useRouter } from 'next/navigation'
import { MessageCircleQuestion, PlusIcon } from 'lucide-react'

import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ChecklistsColumn, columns } from './columns'

interface QuestionProps {
  id?: string
  checklists: ChecklistsColumn[]
}

const ChecklistClient = ({ checklists }: QuestionProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Checklists"
          description="Manage your checklists"
          icon={<MessageCircleQuestion />}
        />
        <Button size="sm" onClick={() => router.push('/checklists')}>
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<ChecklistsColumn, any>
        columns={columns}
        data={checklists}
        filterKey="name"
        isAdd={false}
        facetedFilters={[]}
      />
    </div>
  )
}

export default ChecklistClient
