'use server'

import { db } from '@/lib/db'
import { FormStatus } from '@prisma/client'
import { format } from 'date-fns'
import { NextResponse } from 'next/server'

interface Model {
  id?: string
  name: string
  status: FormStatus
  image: string
  groupsId: string
}

// create
export const createModel = async ({
  id,
  name,
  status,
  image,
  groupsId
}: Model): Promise<any> => {
  try {
    const existingModel = await getModelByName(name)
    const group = await db.groups.findUnique({
      where: { id: groupsId }
    })

    if (!group) {
      return new NextResponse('Group not found', { status: 400 })
    }

    if (id) {
      return await db.models.update({
        where: { id },
        data: { name, status, image, groupName: group.name }
      })
    }

    if (existingModel) {
      return new NextResponse('Model already exists', { status: 400 })
    } else {
      return await db.models.create({
        data: {
          name,
          status,
          image: image || '',
          groupName: group.name
        }
      })
    }
  } catch (error) {
    console.error('Error creating model:', error)
    return new NextResponse('Failed to create model', { status: 500 })
  }
}

export const getModelByName = async (name: string) => {
  return await db.models.findUnique({
    where: { name }
  })
}

export const deleteModel = async (id: string) => {
  try {
    await db.models.delete({ where: { id } })
  } catch (error) {
    console.error(error)
    return new NextResponse('Failed to delete vehicle model', { status: 500 })
  }
}

export const getModelById = async (id: string) => {
  try {
    return await db.models.findUnique({
      where: { id },
      include: { groups: true }
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getModels = async () => {
  try {
    const models = await db.models.findMany({
      include: { groups: true },
      orderBy: { createdAt: 'desc' }
    })

    const formattedModels = models.map((item) => ({
      id: item.id,
      name: item.name,
      group: item.groupName,
      status: item.status,
      createdAt: format(item.createdAt, 'dd-MM-yyyy'),
      updatedAt: format(item.updatedAt, 'dd-MM-yyyy')
    }))

    return formattedModels
  } catch (error) {
    console.error(error)
    return null
  }
}

export const importModels = async (
  modelData: {
    name: string
    group: string
    status: FormStatus
  }[]
) => {
  try {
    const results = []

    for (const model of modelData) {
      try {
        // Find the group by name
        const group = await db.groups.findUnique({
          where: { name: model.group }
        })

        if (!group) {
          results.push({
            success: false,
            error: `Group not found: ${model.group}`,
            model: model.name
          })
          continue
        }

        // Check if model already exists
        const existingModel = await getModelByName(model.name)
        if (existingModel) {
          results.push({
            success: false,
            error: 'Model already exists',
            model: model.name
          })
          continue
        }

        // Create the model
        const createdModel = await db.models.create({
          data: {
            name: model.name,
            status:
              model.status === 'Active'
                ? FormStatus.Active
                : FormStatus.Passive,
            image: '',
            groupName: group.name
          }
        })

        results.push({
          success: true,
          model: createdModel.name
        })
      } catch (modelError) {
        console.error('Error processing model:', model, modelError)
        results.push({
          success: false,
          error:
            modelError instanceof Error
              ? modelError.message
              : 'Unknown error occurred',
          model: model.name
        })
      }
    }

    return {
      success: true,
      results
    }
  } catch (error: any) {
    console.error('Error importing models:', error)
    return {
      success: false,
      error: 'Failed to import models',
      details: error.message
    }
  }
}
