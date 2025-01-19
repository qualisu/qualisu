'use server'

import { AnswerFormValues } from '@/app/(qualisu)/simulators/[id]/answer-form'
import { db } from '@/lib/db'
import { SimulatorStatus } from '@prisma/client'
import { format } from 'date-fns'

export const getChecklists = async ({
  pointId,
  itemNo
}: {
  pointId: string
  itemNo?: string
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
      const vinCodePart = itemNo.substring(0, 11)

      // First find the vehicle with this vinCode
      const vehicle = await db.vehicles.findFirst({
        where: { vinCode: vinCodePart },
        include: { models: true }
      })

      if (vehicle) {
        baseQuery.where.AND.push({
          models: { some: { id: vehicle.modelsId } }
        })
      }
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
    console.error('Error in getChecklists:', error)
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
      where: {
        itemNo,
        pointsId,
        checklistsId
      },
      include: {
        points: true,
        checklists: { include: { questions: true } }
      }
    })

    if (existingSimulator) return existingSimulator

    // First verify that the checklist exists
    const checklist = await db.checklists.findUnique({
      where: { id: checklistsId }
    })

    if (!checklist) {
      throw new Error('Checklist not found')
    }

    const res = await db.simulators.create({
      data: {
        itemNo,
        pointsId,
        checklistsId,
        status: SimulatorStatus.Continue
      },
      include: {
        points: true,
        checklists: { include: { questions: true } }
      }
    })

    return res
  } catch (error) {
    console.error('Create simulator error:', error)
    return null
  }
}

export const getSimulatorById = async (id: string) => {
  console.log('id', id)

  try {
    const simulator = await db.simulators.findUnique({
      where: { id },
      include: {
        points: true,
        checklists: { include: { questions: true } }
      }
    })

    if (!simulator) {
      throw new Error('Simulator not found')
    }

    return simulator
  } catch (error) {
    console.error('Get simulator error:', error)
    return null
  }
}
