import {
  getChecklistTypes,
  getQuestionById,
  getTags
} from '@/features/checklists/questions/api/server-actions'
import QuestionForm from '@/features/checklists/questions/components/question-form'
import { QuestionsColumn } from '../questions-columns'
import { ChecklistTypes, Tags } from '@prisma/client'
import { getSubCategories } from '@/features/parameters/categories/api/server-actions'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const question = await getQuestionById(searchParams.id ?? '')
  const checklistTypes = await getChecklistTypes()
  const subCategories = await getSubCategories()
  const tags = await getTags()

  if (!question) {
    return <div>No data found</div>
  }

  return (
    <div className="px-2">
      <QuestionForm
        checklistTypes={checklistTypes as ChecklistTypes[]}
        subCategories={subCategories as SubCategoriesColumn[]}
        initialData={question as unknown as QuestionsColumn}
        tags={tags as Tags[]}
        id={searchParams.id}
      />
    </div>
  )
}
