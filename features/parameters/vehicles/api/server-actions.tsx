'use server'

import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'

interface Vehicle {
  saseNo: string
  warStart: Date
  warEnd: Date
  vehicleGroup: string
  vehicleModel: string
  prodDate: Date
  country: string
  checklistsId: string
}

// create
export const createVehicle = async ({
  saseNo,
  warStart,
  warEnd,
  vehicleGroup,
  vehicleModel,
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
          vehicleGroup,
          vehicleModel,
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
          vehicleGroup,
          vehicleModel,
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
      orderBy: { warStart: 'desc' }
    })

    if (!vehicles) return []

    return vehicles.map((vehicle) => ({
      saseNo: vehicle.saseNo,
      warStart: vehicle.warStart,
      warEnd: vehicle.warEnd,
      vehicleGroup: vehicle.vehicleGroup,
      vehicleModel: vehicle.vehicleModel,
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
        vehicleGroup: row.vehicleGroup,
        vehicleModel: row.vehicleModel,
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
