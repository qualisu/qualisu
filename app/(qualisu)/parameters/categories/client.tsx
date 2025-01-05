'use client'

import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CategoriesColumn, columns } from './category-columns'
import { deleteFailure } from '@/features/parameters/failures/api/server-actions'
import { SubCategoriesColumn, subColumns } from './sub-category-columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface FailuresClientProps {
  id?: string
  categories: CategoriesColumn[]
  subCategories: SubCategoriesColumn[]
}

const CategoriesClient = ({
  id,
  categories,
  subCategories
}: FailuresClientProps) => {
  const router = useRouter()

  const handleDelete = async () => {
    if (!id) return
    await deleteFailure(id)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <Tabs defaultValue="categories" className="h-full space-y-6">
        <div className="space-between flex items-center">
          <TabsList>
            <TabsTrigger value="categories">Category-I</TabsTrigger>
            <TabsTrigger value="subCategories">Category-II</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent
          value="categories"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Category-I
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your main categories
              </p>
            </div>
            <div className="ml-auto mr-4">
              <Button
                size="sm"
                onClick={() => router.push('/parameters/categories/create')}
              >
                <PlusIcon className="size-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <DataTable
            columns={columns}
            data={categories}
            filterKey="name"
            onDelete={handleDelete}
          />
        </TabsContent>
        <TabsContent
          value="subCategories"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">
                Category-II
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your sub categories
              </p>
            </div>
            <div className="ml-auto mr-4">
              <Button
                size="sm"
                onClick={() => router.push('/parameters/categories/sub/create')}
              >
                <PlusIcon className="size-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
          <Separator className="my-4" />
          <DataTable
            columns={subColumns}
            data={subCategories}
            filterKey="name"
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CategoriesClient
