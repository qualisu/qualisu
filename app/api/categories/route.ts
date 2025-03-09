import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Tüm kategorileri getir
export async function GET() {
  try {
    const mainCategories = await db.failureCategory.findMany({
      include: {
        subCategories: true
      }
    })

    const formattedData = mainCategories.map((category) => ({
      mainCategory: category.name,
      subCategories: category.subCategories.map((sub) => ({
        value: sub.name,
        label: sub.name
      }))
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Yeni kategori ekle
export async function POST(req: Request) {
  const { mainCategory, subCategory } = await req.json()

  const category = await db.failureCategory.upsert({
    where: { name: mainCategory },
    update: {
      subCategories: {
        connectOrCreate: {
          where: {
            name_mainCategoryId: {
              name: subCategory,
              mainCategoryId:
                (
                  await db.failureCategory.findUnique({
                    where: { name: mainCategory }
                  })
                )?.id || ''
            }
          },
          create: { name: subCategory }
        }
      }
    },
    create: {
      name: mainCategory,
      subCategories: {
        create: { name: subCategory }
      }
    }
  })

  return NextResponse.json(category)
}
