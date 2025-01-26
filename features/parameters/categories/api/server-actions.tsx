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
  failureCodes: string[]
  mainCategoryId: string
}

export const getCategoryByName = async (name: string) => {
  return await db.failureCategory.findUnique({
    where: { name }
  })
}

export const getSubCategoryByName = async (name: string) => {
  return await db.failureSubCategory.findUnique({
    where: { name }
  })
}

export const getCategoryById = async (id: string) => {
  const category = await db.failureCategory.findUnique({
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

export const getSubCategoryById = async (id: string | undefined) => {
  const subCategory = await db.failureSubCategory.findUnique({
    where: { id },
    include: { mainCategory: true, failureCodes: true }
  })

  const formattedData = {
    id: subCategory?.id,
    name: subCategory?.name,
    mainCategoryId: subCategory?.mainCategoryId,
    mainCategory: subCategory?.mainCategory.name,
    failureCodes: subCategory?.failureCodes,
    status: subCategory?.status,
    createdAt: format(subCategory?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(subCategory?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const getCategories = async () => {
  try {
    const res = await db.failureCategory.findMany({
      orderBy: { updatedAt: 'desc' }
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
    const res = await db.failureSubCategory.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { failureCodes: true, mainCategory: true }
    })

    const formattedData: SubCategoriesColumn[] = res.map((item) => ({
      id: item.id,
      name: item.name,
      mainCategoryId: item.mainCategoryId,
      mainCategory: item.mainCategory.name,
      failureCodes: item.failureCodes,
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
      return await db.failureCategory.update({
        where: { id },
        data: { name, status }
      })
    } else {
      if (existingCategory) {
        return new NextResponse('Category already exists', { status: 400 })
      } else {
        return await db.failureCategory.create({
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
  failureCodes,
  mainCategoryId,
  status
}: SubCategories): Promise<any> => {
  try {
    const existingSubCategory = await getSubCategoryById(id)

    if (id) {
      await db.failureSubCategory.update({
        where: { id },
        data: { failureCodes: { set: [] } }
      })

      console.log(failureCodes)

      return await db.failureSubCategory.update({
        where: { id },
        data: {
          name,
          status,
          mainCategoryId,
          failureCodes: {
            connect: failureCodes.map((failure) => ({ code: failure }))
          }
        }
      })
    } else {
      if (existingSubCategory) {
        return new NextResponse('Sub Category already exists', { status: 400 })
      } else {
        return await db.failureSubCategory.create({
          data: {
            name,
            status,
            mainCategoryId,
            failureCodes: {
              connect: failureCodes.map((failure) => ({ code: failure }))
            }
          }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const deleteMainCategory = async (id: string) => {
  try {
    await db.failureCategory.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete category', { status: 500 })
  }
}

export const deleteSubCategory = async (id: string) => {
  try {
    await db.failureSubCategory.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete sub categories', { status: 500 })
  }
}

export const getSubCategoryOptions = async () => {
  try {
    const subCategories = await db.failureSubCategory.findMany({
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
