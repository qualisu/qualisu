'use client'

import { useRouter } from 'next/navigation'
import { AnswerType } from '@prisma/client'
import { useState, useMemo } from 'react'
import { MessageCircleQuestion, PlusIcon } from 'lucide-react'

import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { QuestionCatalog, columns } from './columns'

interface QuestionsListsClientProps {
  questions: QuestionCatalog[]
}

const QuestionsListsClient = ({ questions }: QuestionsListsClientProps) => {
  const router = useRouter()

  const [data, setData] = useState<QuestionCatalog[]>(questions)
  const [isLoading, setIsLoading] = useState(false)

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        questions.map(
          (item) =>
            `${item.subCategory.mainCategory.name} / ${item.subCategory.name}` as string
        )
      )
    )
    return uniqueCategories.map((category) => ({
      label: category,
      value: category
    }))
  }, [questions])

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Questions"
          description="Manage your questions"
          icon={<MessageCircleQuestion />}
        />
        <Button size="sm" onClick={() => router.push('/questions/')}>
          <PlusIcon className="size-4 mr-2" />
          Add New
        </Button>
      </div>
      <DataTable<QuestionCatalog, string>
        columns={columns}
        data={data}
        filterKey="name"
        isAdd={false}
        disabled={isLoading}
        facetedFilters={[
          {
            column: 'subCategoryName',
            title: 'Category',
            options: categoryOptions
          }
        ]}
      />
    </div>
  )
}

export default QuestionsListsClient
