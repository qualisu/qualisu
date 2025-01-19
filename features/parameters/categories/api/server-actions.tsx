'use server'

import { CategoriesColumn } from '@/app/(qualisu)/parameters/categories/category-columns'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'
import { db } from '@/lib/db'
import { FormStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

interface SubCategories {
  id?: string
  name: string
  status: FormStatus
  failures: string[]
  categoryId: string
}

export const getCategoryByName = async (name: string) => {
  return await db.categories.findUnique({
    where: { name }
  })
}

export const getSubCategoryByName = async (name: string) => {
  return await db.subCategories.findUnique({
    where: { name }
  })
}

export const getCategoryById = async (id: string) => {
  const category = await db.categories.findUnique({
    where: { id }
  })

  const formattedData = {
    id: category?.id,
    name: category?.name,
    status: category?.status,
    createdAt: format(category?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(category?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const getSubCategoryById = async (id: string) => {
  const subCategory = await db.subCategories.findUnique({
    where: { id },
    include: { categories: true, failures: true }
  })

  const formattedData = {
    id: subCategory?.id,
    name: subCategory?.name,
    categoryId: subCategory?.categories.id,
    category: subCategory?.categories.name,
    failures: subCategory?.failures,
    status: subCategory?.status,
    createdAt: format(subCategory?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(subCategory?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const getCategories = async () => {
  try {
    const res = await db.categories.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const formattedData: CategoriesColumn[] = res.map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch categories', { status: 500 })
  }
}

export const getSubCategories = async () => {
  try {
    const res = await db.subCategories.findMany({
      orderBy: { createdAt: 'desc' },
      include: { failures: true, categories: true }
    })

    const formattedData: SubCategoriesColumn[] = res.map((item) => ({
      id: item.id,
      name: item.name,
      categoryId: item.categoriesId,
      failures: item.failures,
      category: item.categories.name,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch sub categories', { status: 500 })
  }
}

export const createCategory = async ({
  id,
  name,
  status
}: SubCategories): Promise<any> => {
  try {
    const existingCategory = await getCategoryByName(name)

    if (id) {
      return await db.categories.update({
        where: { id },
        data: { name, status }
      })
    } else {
      if (existingCategory) {
        return new NextResponse('Category already exists', { status: 400 })
      } else {
        return await db.categories.create({
          data: { name, status }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const createSubCategory = async ({
  id,
  name,
  failures,
  categoryId,
  status
}: SubCategories): Promise<any> => {
  try {
    const existingSubCategory = await getSubCategoryByName(name)

    if (id) {
      await db.subCategories.update({
        where: { id },
        data: { failures: { set: [] } }
      })

      return await db.subCategories.update({
        where: { id },
        data: {
          name,
          status,
          categoriesId: categoryId,
          failures: {
            connect: failures.map((failure) => ({ id: failure }))
          }
        }
      })
    } else {
      if (existingSubCategory) {
        return new NextResponse('Sub Category already exists', { status: 400 })
      } else {
        return await db.subCategories.create({
          data: {
            name,
            status,
            categoriesId: categoryId,
            failures: {
              connect: failures.map((failure) => ({ id: failure }))
            }
          }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteCategory = async (id: string) => {
  try {
    await db.categories.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete category', { status: 500 })
  }
}

export const deleteSubCategory = async (id: string) => {
  try {
    await db.subCategories.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete sub categories', { status: 500 })
  }
}

export const getSubCategoryOptions = async () => {
  try {
    const subCategories = await db.subCategories.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })

    return subCategories.map((subCategory) => ({
      label: subCategory.name,
      value: subCategory.id
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}
