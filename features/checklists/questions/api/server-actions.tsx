'use server'

import { db } from '@/lib/db'
import { format } from 'date-fns'
import { ChecklistFormValues } from '../components/checklist-form'
import { cTypes } from '@prisma/client'

export const getQuestions = async () => {
  const questions = await db.qCatalog.findMany()
  return questions
}

export const getChecklists = async () => {
  const checklists = await db.checklists.findMany({
    include: {
      groups: true,
      models: true,
      points: true
    }
  })

  const formattedChecklists = checklists.map((checklist) => ({
    ...checklist,
    createdAt: format(checklist.createdAt, 'dd/MM/yyyy'),
    updatedAt: format(checklist.updatedAt, 'dd/MM/yyyy')
  }))

  return formattedChecklists
}

export const getChecklistById = async (id: string) => {
  const checklist = await db.checklists.findUnique({
    where: { id },
    include: {
      groups: true,
      models: true,
      points: true,
      questions: true,
      vehicles: true
    }
  })

  if (!checklist) {
    return null
  }

  return {
    ...checklist,
    createdAt: format(checklist.createdAt, 'dd/MM/yyyy'),
    updatedAt: format(checklist.updatedAt, 'dd/MM/yyyy')
  }
}

export const createChecklist = async (checklist: ChecklistFormValues) => {
  const newChecklist = await db.checklists.create({
    data: {
      name: checklist.name,
      type: checklist.type as cTypes,
      itemNo: checklist.itemNo ?? [],
      groups: checklist.groupIds
        ? { connect: checklist.groupIds.map((id) => ({ id })) }
        : undefined,
      models: checklist.modelIds
        ? { connect: checklist.modelIds.map((id) => ({ id })) }
        : undefined,
      vehicles: checklist.vehicleIds
        ? { connect: checklist.vehicleIds.map((id) => ({ id })) }
        : undefined,
      questions: checklist.questions
        ? { connect: checklist.questions.map((id: string) => ({ id })) }
        : undefined
    }
  })
  return newChecklist
}
