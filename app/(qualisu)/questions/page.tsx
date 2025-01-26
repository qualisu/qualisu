// questions/page.tsx

import QuestionStepsPage from '@/app/(qualisu)/questions/client'
import { getSubCategories } from '@/features/parameters/categories/api/server-actions'

export default async function QuestionPage() {
  const subCategories = await getSubCategories()

  if (!Array.isArray(subCategories)) {
    throw new Error('Failed to fetch sub categories')
  }

  return (
    <div className="py-5 px-2.5">
      <QuestionStepsPage subCategories={subCategories} />
    </div>
  )
}
