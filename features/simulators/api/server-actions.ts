'use server'

import { AnswerFormValues } from '@/app/(qualisu)/simulators/[id]/answer-form'
import { db } from '@/lib/db'
import { SimulatorStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

export const getIndependentChecklists = async (pointId: string) => {
  try {
    const res = await db.checklists.findMany({
      orderBy: { createdAt: 'desc' },
      where: { points: { some: { id: pointId } } },
      include: { questions: true, checklistTypes: true }
    })
    return res
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to fetch questions', { status: 500 })
  }
}

export const getMandatoryChecklists = async ({
  pointId,
  groupId,
  modelId,
  vehicleId,
  itemNo,
  searchQuery
}: {
  pointId: string
  groupId?: string
  modelId?: string
  vehicleId?: string
  itemNo?: string
  searchQuery?: string
}) => {
  try {
    const baseQuery: any = {
      where: {
        points: { some: { id: pointId } },
        AND: [] as any[]
      },
      include: {
        questions: true,
        checklistTypes: true,
        simulators: true,
        points: true,
        groups: true,
        models: true,
        vehicle: true
      }
    }

    if (itemNo) {
      baseQuery.where.itemNo = { has: itemNo }
    }

    if (vehicleId) {
      baseQuery.where.AND.push({
        vehicle: { some: { id: vehicleId } }
      })
    }

    if (modelId) {
      baseQuery.where.AND.push({
        models: { some: { id: modelId } }
      })
    }

    if (groupId) {
      baseQuery.where.AND.push({
        groups: { some: { id: groupId } }
      })
    }

    if (searchQuery) {
      baseQuery.where.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      })
    }

    if (baseQuery.where.AND.length === 0) {
      baseQuery.where = {
        points: { some: { id: pointId } }
      }
    }

    const res = await db.checklists.findMany(baseQuery)

    const formatData = res.map((item) => {
      return {
        ...item,
        createdAt: format(item.createdAt, 'dd/MM/yyyy'),
        updatedAt: format(item.updatedAt, 'dd/MM/yyyy'),
        dateStart: item.dateStart ? format(item.dateStart, 'dd/MM/yyyy') : null,
        dateEnd: item.dateEnd ? format(item.dateEnd, 'dd/MM/yyyy') : null
      }
    })

    return formatData
  } catch (error) {
    console.error('Error in getMandatoryChecklists:', error)
    return []
  }
}

export const createAnswer = async ({
  answer,
  images,
  description,
  simulator,
  questionId
}: AnswerFormValues) => {
  try {
    if (!simulator) throw new Error('Simulator is required')
    if (!questionId) throw new Error('Question ID is required')

    const existingAnswer = await db.answers.findFirst({
      where: { simulatorsId: simulator, questionId }
    })

    const isValidSimulatorId = await db.simulators.findFirst({
      where: { id: simulator }
    })

    if (!isValidSimulatorId) throw new Error('Simulator ID is invalid')

    if (existingAnswer) {
      await db.answers.update({
        where: { id: existingAnswer.id },
        data: { answer, description, images, questionId }
      })
    } else {
      await db.answers.create({
        data: {
          answer,
          description,
          images,
          questionId,
          simulatorsId: simulator
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Create answer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create answer'
    }
  }
}

export const createSimulator = async ({
  itemNo,
  pointsId,
  checklistsId
}: {
  itemNo: string
  pointsId: string
  checklistsId: string
}) => {
  try {
    const existingSimulator = await db.simulators.findFirst({
      where: { itemNo, pointsId }
    })

    if (existingSimulator) return existingSimulator

    const res = await db.simulators.create({
      data: {
        itemNo,
        pointsId,
        status: SimulatorStatus.Continue,
        checklistsId
      }
    })

    return res
  } catch (error) {
    console.error('Create simulator error:', error)
  }
}

export const finishSimulators = async (simulator: string) => {
  try {
    await db.simulators.update({
      where: { id: simulator },
      data: { status: SimulatorStatus.Completed }
    })
  } catch (error) {
    console.error('Finish simulator error:', error)
  }
}

export const getSimulatorId = async ({
  itemNo,
  pointsId,
  checklistsId
}: {
  itemNo: string
  pointsId: string
  checklistsId: string
}) => {
  try {
    const res = await db.simulators.findFirst({
      where: { itemNo, pointsId, checklistsId }
    })
    return res?.id
  } catch (error) {
    console.error('Get simulator ID error:', error)
  }
}
