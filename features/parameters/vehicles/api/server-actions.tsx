'use server'

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'

interface Vehicle {
  saseNo: string
  warStart: Date
  warEnd: Date
  vehicleGroupId: string
  vehicleModelId: string
  prodDate: Date
  country: string
  checklistsId: string
}

// create
export const createVehicle = async ({
  saseNo,
  warStart,
  warEnd,
  vehicleGroupId,
  vehicleModelId,
  prodDate,
  country
}: Vehicle): Promise<any> => {
  try {
    const existingVehicle = await getVehicleBysaseNo(saseNo)

    if (existingVehicle) {
      return await db.vehicles.update({
        where: { saseNo },
        data: {
          saseNo,
          warStart,
          warEnd,
          vehicleGroupId,
          vehicleModelId,
          prodDate,
          country
        }
      })
    }

    if (existingVehicle) {
      return new NextResponse('Vehicle already exists', { status: 400 })
    } else {
      return await db.vehicles.create({
        data: {
          saseNo,
          warStart,
          warEnd,
          vehicleGroupId,
          vehicleModelId,
          prodDate,
          country
        }
      })
    }
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return new NextResponse('Failed to create vehicle', { status: 500 })
  }
}

export const getVehicleBysaseNo = async (saseNo: string) => {
  return await db.vehicles.findUnique({
    where: { saseNo }
  })
}

export const deleteVehicle = async (saseNo: string) => {
  try {
    await db.vehicles.delete({ where: { saseNo } })
    revalidatePath('/parameters/vehicles')
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    throw error
  }
}

export const getVehicleById = async (saseNo: string) => {
  try {
    return await db.vehicles.findUnique({
      where: { saseNo }
    })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return null
  }
}

export const getVehicles = async () => {
  try {
    const vehicles = await db.vehicles.findMany({
      include: { groups: true, models: true },
      orderBy: { warStart: 'desc' }
    })

    if (!vehicles) return []

    return vehicles.map((vehicle) => ({
      saseNo: vehicle.saseNo,
      warStart: vehicle.warStart,
      warEnd: vehicle.warEnd,
      vehicleGroup: vehicle.groups.name,
      vehicleModel: vehicle.models.name,
      prodDate: vehicle.prodDate,
      country: vehicle.country
    }))
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }
}

export async function uploadVehicles(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const vehicles = data.map((row: any) => {
      // Convert Excel serial numbers to JavaScript Date objects
      const warStart = new Date(
        Math.round((row.warStart - 25569) * 86400 * 1000)
      )
      const warEnd = new Date(Math.round((row.warEnd - 25569) * 86400 * 1000))
      const prodDate = new Date(
        Math.round((row.prodDate - 25569) * 86400 * 1000)
      )

      return {
        saseNo: row.saseNo,
        warStart,
        warEnd,
        vehicleGroupId: row.vehicleGroup,
        vehicleModelId: row.vehicleModel,
        prodDate,
        country: row.country || 'TR' // Default to TR if not provided
      }
    })

    await db.vehicles.createMany({
      data: vehicles,
      skipDuplicates: true
    })

    revalidatePath('/parameters/vehicles')
  } catch (error) {
    console.error('Error uploading vehicles:', error)
    throw error
  }
}

export const getFilteredVehicles = async (
  search?: string,
  page: number = 1,
  limit: number = 50,
  selectedGroups: string[] = [],
  selectedModels: string[] = []
) => {
  try {
    const skip = (page - 1) * limit

    // Create where clause
    const where = {
      AND: [
        // Search filter - only search in saseNo and country
        search
          ? {
              OR: [
                { saseNo: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {},
        // Group filter
        selectedGroups.length > 0
          ? {
              vehicleGroup: { in: selectedGroups }
            }
          : {},
        // Model filter
        selectedModels.length > 0
          ? {
              vehicleModel: { in: selectedModels }
            }
          : {}
      ]
    } as any // Type assertion to avoid Prisma type issues

    // Get filtered vehicles
    const vehicles = await db.vehicles.findMany({
      where,
      skip,
      take: limit,
      orderBy: { warStart: 'desc' }
    })

    // Get total count for pagination
    const total = await db.vehicles.count({ where })

    return {
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle.saseNo,
        name: `${vehicle.saseNo} - ${vehicle.country}`,
        saseNo: vehicle.saseNo,
        warStart: vehicle.warStart,
        warEnd: vehicle.warEnd,
        vehicleGroupId: vehicle.vehicleGroupId,
        vehicleModelId: vehicle.vehicleModelId,
        prodDate: vehicle.prodDate,
        country: vehicle.country
      })),
      total,
      hasMore: skip + vehicles.length < total
    }
  } catch (error) {
    console.error('[DEBUG] Error in getFilteredVehicles:', error)
    return { vehicles: [], total: 0, hasMore: false }
  }
}
