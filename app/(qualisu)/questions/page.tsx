// questions/page.tsx

import QuestionStepsPage from '@/app/(qualisu)/questions/client'
import { getSubCategories } from '@/features/parameters/categories/api/server-actions'
import {
  getQuestionCatalogById,
  getTags
} from '@/features/questions/api/server-actions'
import { QuestionCatalog, Tags } from '@prisma/client'

interface Props {
  searchParams: { id?: string }
}

export default async function QuestionPage({ searchParams }: Props) {
  const subCategories = await getSubCategories()
  const tags = await getTags()
  const question = await getQuestionCatalogById(searchParams.id ?? '')

  if (!Array.isArray(subCategories)) {
    throw new Error('Failed to fetch sub categories')
  }

  return (
    <div className="py-5 px-2.5">
      <QuestionStepsPage
        subCategories={subCategories}
        tags={tags}
        question={question as QuestionCatalog & { tags: Tags[] }}
        mode={searchParams.id ? 'edit' : 'create'}
      />
    </div>
  )
}
