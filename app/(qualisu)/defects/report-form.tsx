'use client'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'

type Category = {
  mainCategory: string
  subCategories: { value: string; label: string }[]
}

type Suggestion = {
  mainCategory: string
  subCategory: string
}

export function ReportForm() {
  const [description, setDescription] = useState('')
  const [selectedMain, setSelectedMain] = useState('')
  const [selectedSub, setSelectedSub] = useState('')
  const [customMain, setCustomMain] = useState('')
  const [customSub, setCustomSub] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cache, setCache] = useState<Record<string, Suggestion[]>>({})
  const debouncedDescription = useDebounce(description, 500)

  // Önerileri yükle (Önbellek mantığı entegre edildi)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedDescription) {
        setSuggestions([])
        return
      }

      // Önbellek kontrolü
      if (cache[debouncedDescription]) {
        setSuggestions(cache[debouncedDescription])
        return
      }

      try {
        const response = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: debouncedDescription })
        })

        const data = await response.json()

        setCache((prev) => ({
          ...prev,
          [debouncedDescription]: data.autoSuggestions || []
        }))

        setSuggestions(data.autoSuggestions || [])

        if (data.autoSuggestions?.[0]) {
          setSelectedMain(data.autoSuggestions[0].mainCategory)
          setSelectedSub(data.autoSuggestions[0].subCategory)
        }
      } catch (error) {
        console.error('Öneri hatası:', error)
      }
    }

    fetchSuggestions()
  }, [debouncedDescription])

  // Kategorileri yükle
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalMain = customMain || selectedMain
    const finalSub = customSub || selectedSub

    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        mainCategory: finalMain,
        subCategory: finalSub
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      {/* Hata Tanımı Input */}
      <div>
        <label className="block mb-2 font-medium">Hata Tanımı</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Hata detayını yazın..."
        />
      </div>

      {/* Otomatik Öneriler */}
      {suggestions?.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Önerilen Kategoriler:</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex gap-2 items-center cursor-pointer p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setSelectedMain(suggestion.mainCategory)
                  setSelectedSub(suggestion.subCategory)
                }}
              >
                <span className="font-medium">{suggestion.mainCategory}</span>
                <span className="text-muted-foreground">→</span>
                <span>{suggestion.subCategory}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kategori Seçimleri */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">Ana Kategori</label>
          <Combobox
            value={selectedMain}
            onChange={(value) => {
              setSelectedMain(value as string)
              setSelectedSub('')
              setCustomMain('')
            }}
            options={[
              ...categories.map((c) => ({
                value: c.mainCategory,
                label: c.mainCategory
              })),
              { value: 'custom', label: 'Yeni Ekle...' }
            ]}
          />
          {selectedMain === 'custom' && (
            <Input
              className="mt-2"
              value={customMain}
              onChange={(e) => setCustomMain(e.target.value)}
              placeholder="Yeni ana kategori adı"
            />
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Alt Kategori</label>
          <Combobox
            value={selectedSub}
            onChange={(value) => {
              setSelectedSub(value as string)
              setCustomSub('')
            }}
            options={[
              ...(categories.find((c) => c.mainCategory === selectedMain)
                ?.subCategories || []),
              { value: 'custom', label: 'Yeni Ekle...' }
            ]}
          />
          {selectedSub === 'custom' && (
            <Input
              className="mt-2"
              value={customSub}
              onChange={(e) => setCustomSub(e.target.value)}
              placeholder="Yeni alt kategori adı"
            />
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Raporu Kaydet
      </Button>
    </form>
  )
}
