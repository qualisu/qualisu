import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { description, mainCategory, subCategory } = await req.json()

    // Önce ana kategoriyi oluştur veya bul
    const mainCat = await db.failureCategory.upsert({
      where: { name: mainCategory },
      update: {},
      create: { name: mainCategory }
    })

    // Sonra alt kategoriyi oluştur veya bul
    const subCat = await db.failureSubCategory.upsert({
      where: {
        name_mainCategoryId: {
          name: subCategory,
          mainCategoryId: mainCat.id
        }
      },
      update: {},
      create: {
        name: subCategory,
        mainCategoryId: mainCat.id
      }
    })

    // Raporu oluştur
    const report = await db.report.create({
      data: {
        description,
        mainCategoryName: mainCategory,
        subCategoryName: subCategory
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error creating report:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
