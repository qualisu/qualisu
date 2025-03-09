import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { description } = await req.json()

    // Tüm kategorileri al
    const categories = await db.failureCategory.findMany({
      include: { subCategories: true }
    })

    // Basit bir eşleştirme algoritması
    const suggestions = categories.flatMap((mainCat) =>
      mainCat.subCategories.map((subCat) => ({
        mainCategory: mainCat.name,
        subCategory: subCat.name,
        score: calculateMatchScore(description, mainCat.name, subCat.name)
      }))
    )

    const filteredSuggestions = suggestions.filter(
      (suggestion) => suggestion.score > 0
    )

    const sortedSuggestions = filteredSuggestions.sort(
      (a, b) => b.score - a.score
    )

    const autoSuggestions = sortedSuggestions
      .slice(0, 5)
      .map(({ mainCategory, subCategory }) => ({ mainCategory, subCategory }))

    return NextResponse.json({ autoSuggestions })
  } catch (error) {
    console.error('Hata oluştu:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

function calculateMatchScore(
  description: string,
  mainCat: string,
  subCat: string
): number {
  const searchText = description.toLowerCase()
  const mainCatLower = mainCat.toLowerCase()
  const subCatLower = subCat.toLowerCase()

  let score = 0

  // Ana kategori eşleşmesi
  if (searchText.includes(mainCatLower)) score += 2

  // Alt kategori eşleşmesi
  if (searchText.includes(subCatLower)) score += 3

  // Kelime bazlı eşleşme
  const words = searchText.split(/\s+/)
  words.forEach((word) => {
    if (mainCatLower.includes(word)) score += 1
    if (subCatLower.includes(word)) score += 1
  })

  return score
}
