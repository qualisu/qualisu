import {
  getCategories,
  getSubCategoryById
} from '@/features/parameters/categories/api/server-actions'
import SubCategoryForm from '@/features/parameters/categories/components/sub-category-form'
import { SubCategoriesColumn } from '../../sub-category-columns'
import { getFailures } from '@/features/parameters/failures/api/server-actions'
import { FailuresColumn } from '../../../failures/columns'
import { CategoriesColumn } from '../../category-columns'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function SubCreatePage({ searchParams }: Props) {
  const subCategory = await getSubCategoryById(searchParams.id ?? '')
  const failures = await getFailures()
  const categories = await getCategories()

  if (!subCategory) {
    return <div>No data found</div>
  }

  return (
    <div className="px-2">
      <SubCategoryForm
        id={searchParams.id}
        initialData={subCategory as SubCategoriesColumn}
        failures={failures as FailuresColumn[]}
        categories={categories as CategoriesColumn[]}
      />
    </div>
  )
}
