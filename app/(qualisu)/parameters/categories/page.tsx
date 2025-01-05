import {
  getCategories,
  getSubCategories
} from '@/features/parameters/categories/api/server-actions'
import CategoriesClient from './client'
import { CategoriesColumn } from './category-columns'
import { SubCategoriesColumn } from './sub-category-columns'

const CategoriesPage = async () => {
  const categories = await getCategories()
  const subCategories = await getSubCategories()

  if (!categories || !subCategories) {
    return <div>No data found</div>
  }

  return (
    <CategoriesClient
      categories={categories as CategoriesColumn[]}
      subCategories={subCategories as SubCategoriesColumn[]}
    />
  )
}

export default CategoriesPage
