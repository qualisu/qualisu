'use server'

import { db } from '@/lib/db'
import { format } from 'date-fns'
import { SimulatorStatus } from '@prisma/client'
import { trackChecklistQuestions } from '@/features/checklists/api/server-actions'

interface AnswerFormValues {
  answer: string
  images: string[]
  description: string
  simulator: string
  questionId: string
}

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
        points: true,
        groups: true,
        models: true
      }
    }

    if (itemNo) {
      const vehicle = await db.vehicles.findFirst({
        where: { saseNo: itemNo }
      })

      if (vehicle) {
        baseQuery.where.AND.push({
          models: { some: { id: vehicle.vehicleModelId } }
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
        updatedAt: format(item.updatedAt, 'dd/MM/yyyy')
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
      data: { itemNo, pointsId, checklistsId, status: SimulatorStatus.Planned },
      include: { points: true, checklists: { include: { questions: true } } }
    })

    return res
  } catch (error) {
    console.error('Create simulator error:', error)
    return null
  }
}

export async function getSimulatorById(id: string) {
  try {
    const simulator = await db.simulators.findUnique({
      where: { id },
      include: { checklists: { include: { questions: true } }, points: true }
    })

    return simulator
  } catch (error) {
    console.error('Error fetching simulator:', error)
    throw new Error('Failed to fetch simulator')
  }
}

export const finishSimulators = async (id: string) => {
  try {
    // Get the simulator with its checklist
    const simulator = await db.simulators.findUnique({
      where: { id },
      include: {
        checklists: true
      }
    })

    if (!simulator) {
      throw new Error('Simulator not found')
    }

    // Update simulator status
    await db.simulators.update({
      where: { id },
      data: {
        status: SimulatorStatus.Completed
      }
    })

    // Track question usage for the checklist
    await trackChecklistQuestions(simulator.checklistsId)

    return { success: true }
  } catch (error) {
    console.error('Finish simulator error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to finish simulator'
    }
  }
}

export async function getVehicleByItemNo(itemNo: string) {
  try {
    const vehicle = await db.vehicles.findUnique({
      where: {
        saseNo: itemNo
      },
      include: {
        models: true,
        groups: true
      }
    })

    if (!vehicle) {
      throw new Error('Vehicle not found')
    }

    return {
      model: vehicle.models.name,
      country: vehicle.country,
      chassisNo: vehicle.saseNo,
      fertNo: vehicle.saseNo,
      zobasNo: vehicle.saseNo
    }
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    throw error
  }
}
