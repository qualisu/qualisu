'use client'

import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { MessageCircleQuestion, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { QuestionsColumn, columns } from './questions-columns'
import Heading from '@/components/heading'

interface QuestionProps {
  id?: string
  questions: QuestionsColumn[]
}

const QuestionsClient = ({ questions }: QuestionProps) => {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Questions"
          description="Manage your questions"
          icon={<MessageCircleQuestion />}
        />
        <Button
          size="sm"
          onClick={() => router.push('/checklists/questions/create')}
        >
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<QuestionsColumn, any>
        columns={columns}
        data={questions}
        filterKey="name"
        isAdd={false}
      />
    </div>
  )
}

export default QuestionsClient
