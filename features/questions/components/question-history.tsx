'use client'

import { useState } from 'react'
import { QuestionCatalog, Tags } from '@prisma/client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Clock, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { revertToVersion } from '../api/server-actions'
import { toast } from 'sonner'

interface QuestionHistoryProps {
  questionId: string
  history: (QuestionCatalog & {
    tags: Tags[]
    subCategory: {
      id: string
      name: string
      mainCategory: {
        id: string
        name: string
      }
    }
  })[]
}

export function QuestionHistory({ questionId, history }: QuestionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null)
  const router = useRouter()

  const handleRevert = async (versionId: string) => {
    try {
      setIsLoading(true)
      setLoadingVersionId(versionId)
      const result = await revertToVersion(versionId)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Soru başarıyla eski versiyonuna döndürüldü')
      setIsOpen(false)
      router.refresh()
      router.push('/questions/lists')
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIsLoading(false)
      setLoadingVersionId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Versiyon Geçmişi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Soru Versiyon Geçmişi</DialogTitle>
          <DialogDescription>
            Bu sorunun tüm versiyonlarını görüntüleyebilir ve istediğiniz
            versiyona geri dönebilirsiniz.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((version, index) => (
              <div
                key={version.id}
                className="flex items-start justify-between border rounded-lg p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      Versiyon {version.version}
                    </p>
                    {index === 0 && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                        Güncel
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(version.updatedAt), 'PPpp', {
                      locale: tr
                    })}
                  </p>
                  <p className="text-sm">{version.name}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {version.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                {index !== 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleRevert(version.id)}
                  >
                    {loadingVersionId === version.id ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                        İşleniyor...
                      </div>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Bu Versiyona Dön
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
