import CategoryForm from '@/features/parameters/categories/components/category-form'
import { getCategoryById } from '@/features/parameters/categories/api/server-actions'
import { CategoriesColumn } from '../category-columns'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const category = await getCategoryById(searchParams.id ?? '')

  return (
    <div className="px-2">
      <CategoryForm
        initialData={category as CategoriesColumn}
        id={searchParams.id}
      />
    </div>
  )
}
