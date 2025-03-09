'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Camera, Check, Plus, Search, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CategoriesColumn } from '@/app/(qualisu)/parameters/categories/category-columns'
import MainCategorySelectModal from '@/features/parameters/categories/components/main-category-select-modal'

interface FailureSubCategory {
  id: string
  name: string
}

interface CategorySuggestion {
  name: string
  correctedName?: string
  confidence: number
  isNew?: boolean
  tags?: string[]
}

interface Tag {
  name: string
  isSelected: boolean
}

interface ManualErrorEntryModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleInfo: {
    model: string
    chassisNo: string
    fertNo: string
    zobasNo: string
    country: string
  } | null
}

const ManualErrorEntryModal = ({
  isOpen,
  onClose
}: ManualErrorEntryModalProps) => {
  const [errorDescription, setErrorDescription] = useState('')
  const [isClassifying, setIsClassifying] = useState(false)
  const [showClassificationResult, setShowClassificationResult] =
    useState(false)
  const [selectedErrorLevel, setSelectedErrorLevel] = useState('S')
  const [allCategories, setAllCategories] = useState<FailureSubCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestedCategory, setSuggestedCategory] =
    useState<FailureSubCategory | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<FailureSubCategory | null>(null)
  const [isAllCategoriesSheetOpen, setIsAllCategoriesSheetOpen] =
    useState(false)
  const [suggestedCategories, setSuggestedCategories] = useState<
    CategorySuggestion[]
  >([])
  const [isSavingNewCategory, setIsSavingNewCategory] = useState(false)
  const [isMainCategoryModalOpen, setIsMainCategoryModalOpen] = useState(false)
  const [pendingCategoryName, setPendingCategoryName] = useState('')
  const [categories, setCategories] = useState<CategoriesColumn[]>([])
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([])
  const [customTagInput, setCustomTagInput] = useState('')
  const [isAddingCustomTag, setIsAddingCustomTag] = useState(false)

  // Fetch subcategories from the database
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true)

      // Fetch actual data from the database
      fetch('/api/failure-subcategories')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch subcategories')
          }
          return response.json()
        })
        .then((data) => {
          setAllCategories(data)
        })
        .catch((error) => {
          console.error('Error fetching subcategories:', error)
          toast({
            title: 'Veri Yükleme Hatası',
            description:
              'Kategori verileri yüklenemedi. Lütfen tekrar deneyin.',
            variant: 'destructive'
          })
        })
        .finally(() => {
          setIsLoadingCategories(false)
        })

      // Ana kategorileri getir
      fetch('/api/failure-categories')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch categories')
          }
          return response.json()
        })
        .then((data) => {
          setCategories(data)
        })
        .catch((error) => {
          console.error('Error fetching categories:', error)
        })
    }
  }, [isOpen])

  // Filter categories based on search query
  const filteredCategories =
    searchQuery.trim() === ''
      ? allCategories
      : allCategories.filter((category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

  const checkDirectMatch = (description: string): FailureSubCategory | null => {
    if (!description || !allCategories.length) return null

    // Metni normalize et ve küçük harfe çevir
    const normalizedDescription = description
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')

    // Açıklamadaki kelimeleri ayır
    const descriptionWords = normalizedDescription
      .split(/\s+/) // Boşluklardan böl
      .filter((word) => word.length > 2) // Çok kısa kelimeleri filtrele
      .map((word) => word.replace(/[.,;:!?'"(){}[\]]/g, '')) // Noktalama işaretlerini kaldır

    // En iyi eşleşme için puanlama sistemi oluştur
    let bestMatch: FailureSubCategory | null = null
    let highestScore = 0

    // Tüm kategorileri değerlendir
    for (const category of allCategories) {
      // Kategori adını normalize et
      const normalizedCategoryName = category.name
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')

      // Kategori adındaki kelimeleri ayır
      const categoryWords = normalizedCategoryName
        .split(/\s+/)
        .filter((word) => word.length > 2)
        .map((word) => word.replace(/[.,;:!?'"(){}[\]]/g, ''))

      // Eşleşen kelime sayısını hesapla
      let matchScore = 0

      // Açıklamadaki her kelime için kontrol et
      for (const descWord of descriptionWords) {
        // Tam kelime eşleşmesi
        if (categoryWords.includes(descWord)) {
          matchScore += 2
        } else {
          // Kısmi kelime eşleşmesi (ön ek veya son ek olabilir)
          for (const catWord of categoryWords) {
            if (descWord.includes(catWord) || catWord.includes(descWord)) {
              matchScore += 1
              break
            }
          }
        }
      }

      // Kategori adı tam olarak açıklamada geçiyorsa bonus puan
      if (normalizedDescription.includes(normalizedCategoryName)) {
        matchScore += 3
      }

      // Eğer eşleşme puanı yeterince yüksekse ve en iyi eşleşmeden daha iyiyse güncelle
      if (matchScore > highestScore && matchScore >= 3) {
        highestScore = matchScore
        bestMatch = category
      }
    }

    console.log(
      `Direct match score: ${highestScore} for category: ${
        bestMatch?.name || 'None'
      }`
    )

    return bestMatch
  }

  const classifyWithDeepseek = async (
    description: string
  ): Promise<{
    matchedCategory: FailureSubCategory | null
    suggestions: CategorySuggestion[]
    tags: string[]
  }> => {
    try {
      console.log('deepseek calisiyor...')
      // Deepseek API call
      const response = await fetch(
        'https://api.deepseek.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: `Sen bir otomotiv uzmanısın ve özellikle otobüs, midibüs, kamyon ve kamyonet parçaları konusunda derin bilgiye sahipsin.
                
                Aşağıdaki açıklamayı teknik arıza alt kategorilerine göre sınıflandır. 
                Mevcut kategorilerden en uygun olanı seç ve ayrıca yeni kategori önerileri de sun.
                
                Önerdiğin yeni kategoriler mutlaka otobüs, midibüs, kamyon veya kamyonet parçalarıyla ilgili olmalı ve şu alanlardan birine odaklanmalı:
                - Motor ve güç aktarma organları: Motor bloğu, silindir kafası, turbo, şanzıman, debriyaj, aktarma mili, diferansiyel, aks milleri
                - Şasi ve süspansiyon sistemleri: Hava süspansiyonu, yaprak yay, viraj denge çubuğu, amortisör, şasi kirişleri, traversler
                - Elektrik ve elektronik sistemler: Alternatör, marş motoru, ECU, gösterge paneli, aydınlatma, klima kontrolü, takometre
                - Kabin ve kaporta parçaları: Sürücü/yolcu kapıları, cam mekanizmaları, koltuklar, torpido, konsol, ön panel, bagaj kapağı
                - Fren ve direksiyon sistemleri: Havalı fren, ABS, EBS, disk/kampana fren, hidrolik direksiyon pompası, direksiyon kutusu
                - Yakıt ve egzoz sistemleri: AdBlue sistemi, enjektörler, yakıt pompası, yakıt tankı, egzoz manifoldu, katalizör, susturucu
                - Soğutma ve havalandırma sistemleri: Radyatör, fan, termostat, klima kompresörü, kanallar, kalorifer, ısıtma bobinleri
                - Pnömatik sistemler: Hava kompresörü, hava tankları, basınç regülatörleri, kapı mekanizmaları, hava valfleri
                - Yolcu konfor sistemleri: Koltuk mekanizmaları, yolcu bilgilendirme sistemleri, engelli rampaları, tavan havalandırma
                
                Ayrıca, açıklamada geçen teknik terimleri de etiketler olarak belirt. Etiketler kısa, anlamlı ve açıklayıcı olmalıdır.
                Örneğin, "ön cam silecek motoru arızalı" cümlesi için etiketler: "silecek", "motor", "arıza", "ön cam" olabilir.
                
                JSON formatında döndür:
                
                {
                  "matchedCategoryId": "mevcut kategorilerden en uygun olanın ID'si",
                  "newSuggestions": [
                    {"name": "öneri1", "confidence": 0.85, "tags": ["etiket1", "etiket2"]},
                    {"name": "öneri2", "confidence": 0.72, "tags": ["etiket1", "etiket3"]},
                    {"name": "öneri3", "confidence": 0.65, "tags": ["etiket2", "etiket4"]}
                  ],
                  "tags": ["somun", "tampon", "bağlantı", "sıkılmamış"]
                }
                
                newSuggestions içindeki her öneri için tags alanına, o kategori önerisine uygun etiketleri ekle.
                Ayrıca ana JSON içinde tags alanına, açıklama için genel olarak uygun etiketleri ekle.
                En önemli etiketleri ana tags alanına koy ve en fazla 4-5 tane olsun. Çok fazla etiket ekleme.
                
                En fazla 3 yeni öneri sun ve her biri için güven skorunu 0-1 arasında belirt.
                Öneriler Türkçe olmalı ve ticari araçlara özgü teknik terimler içermeli.
                
                Açıklama: "${description}"
                
                Kullanılacak mevcut kategoriler:
                ${allCategories
                  .map((category) => `- ${category.name} (${category.id})`)
                  .join('\n')}`
              }
            ],
            temperature: 0.1,
            max_tokens: 512
          })
        }
      )

      const data = await response.json()
      console.log('Deepseek response:', data)

      const result = JSON.parse(
        data.choices[0].message.content.replace(/```(json)?/g, '')
      )

      console.log('Parsed result:', result)

      // Find category by ID
      const matchedCategory =
        allCategories.find((cat) => cat.id === result.matchedCategoryId) || null

      // Get new suggestions with confidence scores
      const suggestions = result.newSuggestions.map((suggestion: any) => ({
        ...suggestion,
        isNew: true,
        confidence: parseFloat(suggestion.confidence.toFixed(2)),
        tags: suggestion.tags || []
      }))

      return {
        matchedCategory,
        suggestions,
        tags: result.tags || [] // Ana seviyedeki tags dizisini doğrudan döndür
      }
    } catch (error) {
      console.error('Deepseek API error:', error)
      return {
        matchedCategory: null,
        suggestions: [],
        tags: []
      }
    }
  }

  const saveNewCategory = async (categoryName: string) => {
    setIsSavingNewCategory(true)

    // Ana kategori modali için kategori adını sakla
    setPendingCategoryName(categoryName)

    // Ana kategori seçim modalini aç
    setIsMainCategoryModalOpen(true)
    setIsSavingNewCategory(false)
  }

  const handleCategoryCreated = (newCategory: any) => {
    // Yeni oluşturulan kategoriyi listeye ekle
    setAllCategories([...allCategories, newCategory])

    // Yeni oluşturulan kategoriyi seç
    setSelectedCategory(newCategory)

    // Kategori önerilerini temizle
    setSuggestedCategories([])

    toast({
      title: 'Kategori Oluşturuldu',
      description: `"${newCategory.name}" kategorisi başarıyla oluşturuldu ve seçildi.`
    })
  }

  // Yeni fonksiyon: Özel etiket ekle
  const addCustomTag = () => {
    if (!customTagInput.trim()) return

    // Aynı isimde etiket varsa ekleme
    if (
      suggestedTags.some(
        (tag) => tag.name.toLowerCase() === customTagInput.trim().toLowerCase()
      )
    ) {
      setCustomTagInput('')
      return
    }

    setSuggestedTags([
      ...suggestedTags,
      { name: customTagInput.trim(), isSelected: true }
    ])
    setCustomTagInput('')
    setIsAddingCustomTag(false)
  }

  // Etiket seçim durumunu değiştir
  const toggleTagSelection = (tagName: string) => {
    setSuggestedTags(
      suggestedTags.map((tag) =>
        tag.name === tagName ? { ...tag, isSelected: !tag.isSelected } : tag
      )
    )
  }

  const classifyErrorDescription = async () => {
    if (!errorDescription.trim()) {
      toast({
        title: 'Hata',
        description: 'Lütfen bir hata açıklaması girin.',
        variant: 'destructive'
      })
      return
    }

    setIsClassifying(true)

    try {
      // First check for direct matches in our existing categories
      const directMatch = checkDirectMatch(errorDescription)

      // Kategori eşleşmesinden bağımsız olarak Deepseek API çağrısı yap
      const { matchedCategory, suggestions, tags } = await classifyWithDeepseek(
        errorDescription
      )

      if (directMatch) {
        // Direct match varsa bunu kullan ama Deepseek'in etiket önerilerini kullan
        setSuggestedCategory(directMatch)
        setSelectedCategory(directMatch)
        setSuggestedCategories([])

        // Sadece ana seviyedeki etiketleri kullan
        const tagObjects = tags.map((name) => ({
          name,
          isSelected: true
        }))

        setSuggestedTags(tagObjects)

        toast({
          title: 'Kategori Eşleşmesi Bulundu',
          description: `"${errorDescription}" açıklaması "${directMatch.name}" kategorisine eşleşti.`
        })
      } else {
        // If no direct match, use Deepseek API suggestions
        setSuggestedCategories(suggestions)

        if (matchedCategory) {
          setSuggestedCategory(matchedCategory)
          setSelectedCategory(matchedCategory)

          // Sadece ana seviyedeki etiketleri kullan
          const tagObjects = tags.map((name) => ({
            name,
            isSelected: true
          }))

          setSuggestedTags(tagObjects)

          toast({
            title: 'Kategori Önerisi',
            description: `"${errorDescription}" açıklaması için "${matchedCategory.name}" kategorisi önerildi.`
          })
        } else {
          // Kategori olmasa da sadece ana seviyedeki etiketleri kullan
          const tagObjects = tags.map((name) => ({
            name,
            isSelected: true
          }))

          setSuggestedTags(tagObjects)

          toast({
            title: 'Kategori Bulunamadı',
            description:
              'Mevcut kategorilerden uygun eşleşme bulunamadı. Yeni kategori önerilerini değerlendirebilirsiniz.',
            variant: 'destructive'
          })
        }
      }

      setShowClassificationResult(true)
    } catch (error) {
      console.error('Kategorilendirme hatası:', error)
      toast({
        title: 'Sınıflandırma hatası',
        description: 'Teknik bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
      })
    } finally {
      setIsClassifying(false)
    }
  }

  const selectNewCategorySuggestion = async (
    suggestion: CategorySuggestion
  ) => {
    if (suggestion.isNew) {
      // saveNewCategory artık bir modal açıyor ve sonuç döndürmüyor
      await saveNewCategory(suggestion.name)
      // newCategory bilgisi handleCategoryCreated callback'i üzerinden geliyor
    }
  }

  const handleDeepseekReclassify = async () => {
    setIsClassifying(true)
    try {
      const { matchedCategory, suggestions, tags } = await classifyWithDeepseek(
        errorDescription
      )
      setSuggestedCategories(suggestions)

      if (matchedCategory) {
        setSuggestedCategory(matchedCategory)
        setSelectedCategory(matchedCategory)

        // Sadece ana seviyedeki etiketleri kullan
        const tagObjects = tags.map((name) => ({
          name,
          isSelected: true
        }))

        setSuggestedTags(tagObjects)
      } else {
        // Sadece ana seviyedeki etiketleri kullan
        const tagObjects = tags.map((name) => ({
          name,
          isSelected: true
        }))

        setSuggestedTags(tagObjects)
      }
    } finally {
      setIsClassifying(false)
    }
  }

  const resetForm = () => {
    setErrorDescription('')
    setSuggestedCategory(null)
    setSelectedCategory(null)
    setShowClassificationResult(false)
    setSelectedErrorLevel('S')
    setSearchQuery('')
    setSuggestedTags([])
    setCustomTagInput('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectCategory = (category: FailureSubCategory) => {
    setSelectedCategory(category)
    setIsAllCategoriesSheetOpen(false)

    toast({
      title: 'Kategori Seçildi',
      description: `"${category.name}" kategorisi seçildi.`
    })
  }

  const renderErrorEntryForm = () => {
    return (
      <>
        <DialogHeader className="border-b p-4 flex flex-row items-center justify-between">
          <DialogTitle>Manual Hata Girişi</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="errorDescription">Hata detayı giriniz*</Label>
            <Textarea
              id="errorDescription"
              value={errorDescription}
              onChange={(e) => setErrorDescription(e.target.value)}
              placeholder="Arka kapıda hava kaçağı var..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="p-4">
          <Button
            className="w-full"
            disabled={isClassifying || !errorDescription.trim()}
            onClick={classifyErrorDescription}
          >
            {isClassifying ? 'Sınıflandırılıyor...' : 'Onayla'}
          </Button>
        </DialogFooter>
      </>
    )
  }

  const renderClassificationResult = () => {
    return (
      <>
        <DialogHeader className="border-b p-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeft
              size={20}
              className="cursor-pointer"
              onClick={() => setShowClassificationResult(false)}
            />
            <DialogTitle>Manual Hata Girişi</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="errorDescription">Hata detayı giriniz*</Label>
            <Textarea
              id="errorDescription"
              value={errorDescription}
              readOnly
              className="min-h-[100px]"
            />
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeepseekReclassify}
                disabled={isClassifying || !errorDescription.trim()}
              >
                {isClassifying
                  ? 'Deepseek Çalışıyor...'
                  : 'Deepseek ile Yeniden Sınıflandır'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etiket önerleri*</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.length > 0 ? (
                suggestedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant={tag.isSelected ? 'outline' : 'secondary'}
                    className={
                      tag.isSelected
                        ? 'border-primary cursor-pointer'
                        : 'cursor-pointer'
                    }
                    onClick={() => toggleTagSelection(tag.name)}
                  >
                    {tag.isSelected && (
                      <span className="text-primary">{tag.name}</span>
                    )}
                    {!tag.isSelected && <span>{tag.name}</span>}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  Etiket önerisi bulunamadı
                </div>
              )}

              {isAddingCustomTag ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    className="h-7 w-32"
                    placeholder="Etiket adı"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomTag()
                      } else if (e.key === 'Escape') {
                        setIsAddingCustomTag(false)
                        setCustomTagInput('')
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={addCustomTag}
                    disabled={!customTagInput.trim()}
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      setIsAddingCustomTag(false)
                      setCustomTagInput('')
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setIsAddingCustomTag(true)}
                >
                  <Plus size={16} /> Etiket ekle
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kategori*</Label>
            <div className="space-y-3">
              {suggestedCategory && !selectedCategory && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="justify-center cursor-pointer"
                    onClick={() =>
                      setSelectedCategory(
                        suggestedCategory as FailureSubCategory
                      )
                    }
                  >
                    {suggestedCategory.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    (Önerilen Mevcut Kategori)
                  </span>
                </div>
              )}

              {suggestedCategories.length > 0 && (
                <div className="space-y-2 mt-2">
                  <Label className="text-sm font-medium">
                    Yeni Kategori Önerileri:
                  </Label>
                  {suggestedCategories.map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="justify-center cursor-pointer border-green-500 hover:bg-green-50"
                        onClick={() => selectNewCategorySuggestion(suggestion)}
                      >
                        {suggestion.name}
                        <span className="ml-1 text-xs">
                          (%{Math.round(suggestion.confidence * 100)})
                        </span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => selectNewCategorySuggestion(suggestion)}
                        disabled={isSavingNewCategory}
                      >
                        {isSavingNewCategory
                          ? 'Kaydediliyor...'
                          : 'Ekle ve Seç'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Sheet
                open={isAllCategoriesSheetOpen}
                onOpenChange={setIsAllCategoriesSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Search size={14} />
                    Tümünü Gör
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[400px] sm:w-[540px] p-0"
                >
                  <SheetHeader className="px-4 py-2 border-b">
                    <SheetTitle>Hata Kategorileri</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 border-b">
                    <Input
                      placeholder="Kategori ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  <ScrollArea className="h-[400px] p-4">
                    {isLoadingCategories ? (
                      <div className="flex justify-center p-4">
                        Kategoriler yükleniyor...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredCategories.map((category) => (
                          <Badge
                            key={category.id}
                            variant={
                              selectedCategory?.id === category.id
                                ? 'default'
                                : 'outline'
                            }
                            className="justify-center cursor-pointer py-2"
                            onClick={() => selectCategory(category)}
                          >
                            {category.name}
                            {selectedCategory?.id === category.id && (
                              <Check size={14} className="ml-1" />
                            )}
                          </Badge>
                        ))}
                        {filteredCategories.length === 0 && (
                          <div className="col-span-2 text-center py-4 text-muted-foreground">
                            Arama kriterlerine uygun kategori bulunamadı.
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="justify-center">
                    {selectedCategory.name}
                    <Check size={14} className="ml-1" />
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    (Seçilen)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hata seviyesi*</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={selectedErrorLevel === 'S' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setSelectedErrorLevel('S')}
              >
                S
              </Button>
              <Button
                variant={selectedErrorLevel === 'A' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setSelectedErrorLevel('A')}
              >
                A
              </Button>
              <Button
                variant={selectedErrorLevel === 'C' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setSelectedErrorLevel('C')}
              >
                C
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hata kaynağı*</Label>
            <select className="w-full p-2 border rounded-md">
              <option value="">Seçiniz</option>
              <option value="operator">Operatör</option>
              <option value="equipment">Ekipman</option>
              <option value="material">Malzeme</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Fotoğraf ekleyin*</Label>
            <Button variant="outline" className="w-full">
              <Camera className="mr-2 h-4 w-4" />
              Fotoğraf ekleyin
            </Button>
          </div>
        </div>

        <DialogFooter className="p-4">
          <Button className="w-full" disabled={!selectedCategory}>
            Onayla
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] p-0">
          {!showClassificationResult
            ? renderErrorEntryForm()
            : renderClassificationResult()}
        </DialogContent>
      </Dialog>

      {/* Ana kategori seçim modalı */}
      <MainCategorySelectModal
        isOpen={isMainCategoryModalOpen}
        onClose={() => setIsMainCategoryModalOpen(false)}
        onSuccess={handleCategoryCreated}
        categoryName={pendingCategoryName}
        categories={categories}
      />
    </>
  )
}

export default ManualErrorEntryModal
