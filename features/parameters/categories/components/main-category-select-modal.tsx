'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FormStatus } from '@prisma/client'
import { toast } from '@/components/ui/use-toast'
import { CategoriesColumn } from '@/app/(qualisu)/parameters/categories/category-columns'
import { createSubCategory } from '../api/server-actions'

interface MainCategorySelectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newCategory: any) => void
  categoryName: string
  categories: CategoriesColumn[]
}

export default function MainCategorySelectModal({
  isOpen,
  onClose,
  onSuccess,
  categoryName,
  categories
}: MainCategorySelectModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      toast({
        title: 'Ana Kategori Seçilmedi',
        description: 'Lütfen bir ana kategori seçin.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/failure-subcategories', {
        method: 'POST',
        body: JSON.stringify({
          name: categoryName,
          mainCategoryId: selectedCategoryId
        })
      })

      const newCategory = await response.json()

      // API'dan gelen veriyi tekrar serileştir
      const safeCategory = JSON.parse(JSON.stringify(newCategory))
      onSuccess(safeCategory)
      onClose()
    } catch (error) {
      console.error('Error creating subcategory:', error)
      toast({
        title: 'Alt Kategori Oluşturma Hatası',
        description: 'Yeni alt kategori oluşturulurken bir hata oluştu.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ana Kategori Seçin</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mainCategory">Alt Kategori Adı</Label>
            <div className="p-2 border rounded bg-muted/20">{categoryName}</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mainCategory">Ana Kategori Seçin</Label>
            <Select
              onValueChange={setSelectedCategoryId}
              value={selectedCategoryId}
            >
              <SelectTrigger id="mainCategory">
                <SelectValue placeholder="Ana kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedCategoryId}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
