import {
  getCategories,
  getSubCategoryById
} from '@/features/parameters/categories/api/server-actions'
import SubCategoryForm from '@/features/parameters/categories/components/sub-category-form'
import { getFailures } from '@/features/parameters/failures/api/server-actions'

interface Props {
  searchParams: {
    id?: string
  }
}

export default async function SubCreatePage({ searchParams }: Props) {
  const subCategory = await getSubCategoryById(searchParams.id ?? '')
  const failures = await getFailures()
  const categories = await getCategories()

  // Convert to plain objects
  const initialData = JSON.parse(JSON.stringify(subCategory))
  const failuresData = JSON.parse(JSON.stringify(failures))
  const categoriesData = JSON.parse(JSON.stringify(categories))

  return (
    <div className="px-2">
      <SubCategoryForm
        id={searchParams.id}
        initialData={initialData}
        failureCodes={failuresData}
        categories={categoriesData}
      />
    </div>
  )
}
