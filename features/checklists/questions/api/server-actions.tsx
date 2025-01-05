'use server'

import { QuestionsColumn } from '@/app/(qualisu)/checklists/questions/questions-columns'
import { db } from '@/lib/db'
import { ChecklistTypes, Tags } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'
import { ChecklistsColumn } from '@/app/(qualisu)/checklists/lists/checklists-columns'
import { ChecklistFormValues } from '../components/checklist-form'
import { FormValues } from '../components/question-form'

export const getQuestionById = async (id: string) => {
  const res = await db.questions.findUnique({
    where: { id },
    include: { checklists: true, checklistTypes: true, tags: true }
  })

  const formattedData = {
    id: res?.id,
    name: res?.name,
    description: res?.description,
    grade: res?.grade,
    subCategoriesId: res?.subCategoriesId,
    tags: res?.tags,
    images: res?.images,
    checklistTypes: res?.checklistTypes,
    status: res?.status,
    createdAt: format(res?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(res?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const addQuestionToChecklist = async (
  questionId: string,
  searchParams: string
) => {
  try {
    await db.checklists.update({
      where: { id: searchParams },
      data: { questions: { connect: { id: questionId } } }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch questions', { status: 500 })
  }
}

export const getQuestions = async () => {
  try {
    const res = await db.questions.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        checklists: true,
        subCategories: { include: { categories: true } },
        checklistTypes: true,
        tags: true
      }
    })

    const formattedData: QuestionsColumn[] = res.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      grade: item.grade,
      images: item.images,
      tags: item.tags,
      category: item.subCategories.categories.name,
      subCategory: item.subCategories.name,
      subCategoriesId: item.subCategoriesId,
      checklistTypes: item.checklistTypes,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch questions', { status: 500 })
  }
}

export const deleteQuestion = async (id: string) => {
  await db.questions.delete({
    where: { id }
  })
}

export const createQuestion = async ({
  id,
  name,
  description,
  grade,
  images,
  tags,
  subCategoriesId,
  checklistTypes,
  status
}: FormValues): Promise<any> => {
  try {
    const existingFailure = id ? await getQuestionById(id) : null

    if (id) {
      return await db.questions.update({
        where: { id },
        data: {
          name,
          description,
          grade,
          images,
          tags: {
            set: tags.map((tag) => ({ id: tag }))
          },
          subCategoriesId,
          checklistTypes: {
            set: checklistTypes.map((types) => ({ id: types }))
          },
          status
        }
      })
    } else {
      if (existingFailure) {
        return new NextResponse('Question already exists', { status: 400 })
      } else {
        return await db.questions.create({
          data: {
            name,
            description,
            grade,
            images,
            tags: {
              connect: tags.map((tag) => ({ id: tag }))
            },
            subCategoriesId,
            checklistTypes: {
              connect: checklistTypes.map((types) => ({ id: types }))
            },
            status
          }
        })
      }
    }
  } catch (error) {
    return new NextResponse()
  }
}

export const getChecklistTypes = async (): Promise<ChecklistTypes[]> => {
  try {
    const res = await db.checklistTypes.findMany({
      where: { status: 'Active' },
      orderBy: { createdAt: 'desc' }
    })

    return res
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getTags = async (): Promise<Tags[]> => {
  try {
    return await db.tags.findMany({})
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createTag({ id, name }: Tags) {
  await db.tags.create({
    data: { id, name }
  })
}

// Checklists

export const getChecklists = async () => {
  try {
    const res = await db.checklists.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
        groups: true,
        models: true,
        questions: {
          include: {
            subCategories: { include: { categories: true } },
            tags: true,
            checklistTypes: true
          }
        },
        checklistTypes: true,
        points: true,
        dealers: true
      }
    })

    const formattedData: ChecklistsColumn[] = res.map((item) => ({
      id: item.id,
      itemNo: item.itemNo,
      checklistTypes: {
        id: item.checklistTypes.id,
        name: item.checklistTypes.name,
        createdAt: item.checklistTypes.createdAt,
        updatedAt: item.checklistTypes.updatedAt,
        status: item.checklistTypes.status,
        userGroupsId: item.checklistTypes.userGroupsId
      },
      vehicle: item.vehicle.map((vehicle) => vehicle.name),
      groups: item.groups.map((group) => group.name),
      models: item.models.map((model) => model.name),
      checklistTypesId: item.checklistTypesId,
      simulators: [],
      questions: item.questions.map((question) => ({
        id: question.id,
        name: question.name,
        description: question.description,
        grade: question.grade,
        category: question.subCategories.categories.name,
        subCategory: question.subCategories.name,
        subCategoriesId: question.subCategoriesId,
        tags: question.tags,
        images: question.images,
        checklistTypes: question.checklistTypes,
        status: question.status,
        createdAt: format(question.createdAt, 'dd-MM-yyyy'),
        updatedAt: format(question.updatedAt, 'dd-MM-yyyy')
      })),
      dealers: item.dealers.map((d) => d.id),
      points: item.points,
      dateStart: format(item.dateStart ?? new Date(), 'dd-MM-yyyy'),
      dateEnd: format(item.dateEnd ?? new Date(), 'dd-MM-yyyy'),
      createdAt: format(item.createdAt ?? new Date(), 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt ?? new Date(), 'dd-MM-yyyy')
    }))

    return formattedData
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch questions', { status: 500 })
  }
}

export const getChecklistById = async (id: string) => {
  const res = await db.checklists.findUnique({
    where: { id },
    include: {
      vehicle: true,
      groups: true,
      models: true,
      questions: {
        include: {
          subCategories: {
            include: {
              categories: true
            }
          },
          tags: true,
          checklistTypes: true
        }
      },
      points: true,
      dealers: true
    }
  })

  const formattedData = {
    id: res?.id,
    itemNo: res?.itemNo,
    checklistTypesId: res?.checklistTypesId,
    questions:
      res?.questions.map((question) => ({
        id: question.id,
        name: question.name,
        description: question.description,
        grade: question.grade,
        images: question.images,
        category: question.subCategories.categories.name,
        subCategory: question.subCategories.name,
        subCategoriesId: question.subCategoriesId,
        checklistTypes: question.checklistTypes,
        tags: question.tags,
        status: question.status,
        createdAt: format(question.createdAt, 'dd-MM-yyyy'),
        updatedAt: format(question.updatedAt, 'dd-MM-yyyy')
      })) ?? [],
    vehicles: res?.vehicle ?? [],
    groups: res?.groups ?? [],
    models: res?.models ?? [],
    dealers: res?.dealers ?? [],
    points: res?.points ?? [],
    dateStart: res?.dateStart ? format(res.dateStart, 'dd-MM-yyyy') : undefined,
    dateEnd: res?.dateEnd ? format(res.dateEnd, 'dd-MM-yyyy') : undefined,
    createdAt: format(res?.createdAt ?? new Date(), 'dd-MM-yyyy'),
    updatedAt: format(res?.updatedAt ?? new Date(), 'dd-MM-yyyy')
  }

  return formattedData
}

export const createChecklist = async ({
  id,
  itemNo,
  vehicleIds,
  groupIds,
  modelIds,
  dealers,
  points,
  questions,
  checklistTypesId,
  dateStart,
  dateEnd,
  type
}: ChecklistFormValues): Promise<any> => {
  try {
    if (!checklistTypesId) {
      throw new Error('Checklist type is required')
    }

    if (!points || points.length === 0) {
      throw new Error('At least one control point is required')
    }

    if (!questions || questions.length === 0) {
      throw new Error('At least one question is required')
    }

    const baseData = {
      itemNo: type === 'part' ? itemNo : [],
      dealers: dealers?.length
        ? {
            connect: dealers.map((id) => ({ id }))
          }
        : undefined,
      points: {
        connect: points.map((id) => ({ id }))
      },
      questions: {
        connect: questions.map((id) => ({ id }))
      },
      checklistTypesId,
      dateStart: dateStart ? new Date(dateStart) : undefined,
      dateEnd: dateEnd ? new Date(dateEnd) : undefined
    }

    let result

    if (id) {
      await db.checklists.update({
        where: { id },
        data: {
          vehicle: { set: [] },
          dealers: { set: [] },
          points: { set: [] },
          questions: { set: [] },
          groups: { set: [] },
          models: { set: [] }
        }
      })

      result = await db.checklists.update({
        where: { id },
        data: baseData
      })
    } else {
      result = await db.checklists.create({
        data: baseData
      })
    }

    // Now handle the relationships based on what was selected
    if (type === 'vehicle') {
      let vehiclesToConnect: string[] = []
      let groupsToConnect: string[] = []
      let modelsToConnect: string[] = []

      if (groupIds && groupIds.length > 0) {
        groupsToConnect = groupIds

        // Only include models if they were explicitly selected
        if (modelIds && modelIds.length > 0) {
          modelsToConnect = modelIds
        }

        // Get vehicles if specifically selected
        if (vehicleIds && vehicleIds.length > 0) {
          vehiclesToConnect = vehicleIds
        }
      }

      if (modelIds && modelIds.length > 0) {
        modelsToConnect = modelIds

        if (vehicleIds && vehicleIds.length > 0) {
          vehiclesToConnect = vehicleIds
        }
      }

      if (vehicleIds && vehicleIds.length > 0) {
        vehiclesToConnect = vehicleIds
      }

      // Update the relationships
      result = await db.checklists.update({
        where: { id: result.id },
        data: {
          vehicle:
            vehiclesToConnect.length > 0
              ? {
                  connect: vehiclesToConnect.map((id) => ({ id }))
                }
              : { set: [] },
          groups:
            groupsToConnect.length > 0
              ? {
                  connect: groupsToConnect.map((id) => ({ id }))
                }
              : { set: [] },
          models:
            modelsToConnect.length > 0
              ? {
                  connect: modelsToConnect.map((id) => ({ id }))
                }
              : { set: [] }
        }
      })
    }

    return result
  } catch (error) {
    console.error('Server Error in createChecklist:', error)
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }
}

export const deleteChecklist = async (id: string) => {
  try {
    await db.checklists.delete({
      where: { id }
    })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete checklist', { status: 500 })
  }
}
