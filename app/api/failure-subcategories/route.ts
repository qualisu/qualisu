import { NextResponse } from 'next/server'
import { FormStatus } from '@prisma/client'
import {
  createSubCategory,
  getSubCategories
} from '@/features/parameters/categories/api/server-actions'

export async function GET() {
  try {
    const subCategories = await getSubCategories()
    return NextResponse.json(subCategories)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, mainCategoryId } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // createSubCategory fonksiyonunu kullanarak alt kategori oluştur
    const newSubCategory = await createSubCategory({
      name,
      mainCategoryId,
      status: FormStatus.Active,
      failureCodes: { connect: [] }
    })

    // Serileştirme işlemini burada yapıyoruz
    const safeData = JSON.parse(JSON.stringify(newSubCategory))
    return NextResponse.json(safeData)
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    )
  }
}
