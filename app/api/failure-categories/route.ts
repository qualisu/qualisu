import { NextResponse } from 'next/server'
import { getCategories } from '@/features/parameters/categories/api/server-actions'

export async function GET() {
  try {
    const categories = await getCategories()
    // Prisma nesnelerini seri hale getirip temiz JSON olarak dönüştürüyoruz
    return NextResponse.json(JSON.parse(JSON.stringify(categories)))
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
