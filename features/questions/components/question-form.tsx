'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  FileText,
  Upload,
  X
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { CheckIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { debounce } from 'lodash'
import React from 'react'

import {
  ChecklistTypes,
  QuestionGrade,
  AnswerType,
  QuestionCatalog,
  Tags
} from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import Heading from '@/components/heading'
import { SubCategoriesColumn } from '@/app/(qualisu)/parameters/categories/sub-category-columns'
import {
  createQuestion,
  updateQuestion,
  searchSimilarQuestions,
  getQuestionCatalogById
} from '../api/server-actions'
import { TagsInput } from '@/components/tags'
import { QuestionHistory } from './question-history'
import { createClient } from '@supabase/supabase-js'
import { Card } from '@/components/ui/card'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const questionSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters long' }),
  desc: z.string(),
  type: z.enum(Object.values(ChecklistTypes) as [string, ...string[]]),
  grade: z.enum(Object.values(QuestionGrade) as [string, ...string[]]),
  answerType: z
    .enum(Object.values(AnswerType) as [string, ...string[]])
    .optional(),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
  value: z.string().optional(),
  subCategoryId: z.string(),
  tags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      failureSubCategoryId: z.string().optional()
    })
  ),
  images: z.array(z.string()),
  docs: z.array(z.string()),
  version: z.number(),
  isLatest: z.boolean(),
  prevId: z.string().optional(),
  prev: z.any().optional(),
  next: z.any().optional()
})

type FormValues = z.infer<typeof questionSchema>

interface TagWithCategory extends Tags {
  category?: Array<{ id: string; name: string }>
}

interface SimilarQuestion {
  id: string
  name: string
  desc: string | null
  subCategory: {
    name: string
    mainCategory: {
      name: string
    }
  }
  similarityScore?: number
}

interface QuestionFormProps {
  onBack?: () => void
  selectedOption?: string
  questionTypes: string[]
  subCategories: SubCategoriesColumn[]
  question?: QuestionCatalog
  mode?: 'create' | 'edit'
  uploadedFiles: { images: string[]; docs: string[] }
  tags: TagWithCategory[]
}

// SimilarQuestionsAlert component for displaying similar questions
interface SimilarQuestionsAlertProps {
  similarQuestions: SimilarQuestion[]
  onSelectQuestion: (questionId: string) => void
}

function SimilarQuestionsAlert({
  similarQuestions,
  onSelectQuestion
}: SimilarQuestionsAlertProps) {
  if (similarQuestions.length === 0) return null

  const hasSameQuestion = similarQuestions.some(
    (q) => q.similarityScore === 1.0
  )

  return (
    <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <h3 className="flex items-center gap-2 font-medium mb-2 text-sm">
        <AlertTriangle
          className={hasSameQuestion ? 'text-red-600' : 'text-yellow-600'}
          size={18}
        />
        <span className={hasSameQuestion ? 'text-red-800' : 'text-yellow-800'}>
          {hasSameQuestion
            ? 'UYARI! Aynı soru zaten mevcut!'
            : 'Dikkat! Benzer sorular bulundu'}
        </span>
      </h3>
      <p
        className={`text-sm mb-3 ${
          hasSameQuestion ? 'text-red-700' : 'text-yellow-700'
        }`}
      >
        {hasSameQuestion
          ? 'Aşağıdaki sorunun birebir aynısı zaten sistemde kayıtlı. Mükerrer soru oluşturmak yasaktır!'
          : 'Aşağıdaki benzer soruları kontrol edin ve mükerrer soru oluşturmaktan kaçının:'}
      </p>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {similarQuestions.map((sq) => (
          <div
            key={sq.id}
            className={`bg-white p-3 rounded border transition-colors cursor-pointer ${
              sq.similarityScore === 1.0
                ? 'border-red-400 hover:border-red-600 bg-red-50'
                : 'border-yellow-200 hover:border-yellow-400'
            }`}
            onClick={() => onSelectQuestion(sq.id)}
            tabIndex={0}
            role="button"
            aria-label={`Select question: ${sq.name}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectQuestion(sq.id)
              }
            }}
          >
            <div className="flex justify-between items-start">
              <h4
                className={`font-medium text-sm ${
                  sq.similarityScore === 1.0 ? 'text-red-700' : ''
                }`}
              >
                {sq.name}
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  sq.similarityScore === 1.0
                    ? 'bg-red-100 text-red-800 font-bold'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {sq.similarityScore === 1.0
                  ? 'Birebir aynı soru!'
                  : `${Math.round((sq.similarityScore || 0) * 100)}% benzerlik`}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sq.desc}</p>
            <p className="text-xs text-gray-400 mt-1">
              {sq.subCategory.mainCategory.name} / {sq.subCategory.name}
            </p>
          </div>
        ))}
      </div>

      {/* Warning message if exact duplicate exists */}
      {hasSameQuestion && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p className="text-sm text-red-800 font-medium">
            Lütfen mükerrer soru oluşturmayınız. Sistemde zaten var olan bir
            soruyu tekrar oluşturmak yerine mevcut soruyu kullanınız.
          </p>
        </div>
      )}
    </div>
  )
}

export default function QuestionForm({
  onBack,
  question,
  mode = 'create',
  questionTypes = [],
  subCategories = [],
  uploadedFiles,
  tags
}: QuestionFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [filteredTags, setFilteredTags] = useState(tags)
  const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>(
    []
  )
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(false)
  const justSelectedQuestion = React.useRef(false)

  // Group checklist types for filtering purposes in edit mode
  const checklistTypeGroups = useMemo(() => {
    return {
      // Group 1: Standard, Regulation, Generic
      STANDART: ['STANDART', 'REGULATION', 'GENERIC'],
      REGULATION: ['STANDART', 'REGULATION', 'GENERIC'],
      GENERIC: ['STANDART', 'REGULATION', 'GENERIC'],

      // Group 2: Traceability, Supplier
      TRACING: ['TRACING', 'SUPPLIER'],
      SUPPLIER: ['TRACING', 'SUPPLIER'],

      // Group 3: COP, PARTCOP
      COP: ['COP', 'PARTCOP'],
      PARTCOP: ['COP', 'PARTCOP'],

      // Group 4: Periodic (its own group)
      PERIODIC: ['PERIODIC']
    }
  }, [])

  // Filter questionTypes based on current question type in edit mode
  const availableQuestionTypes = useMemo(() => {
    if (mode === 'edit' && question?.type) {
      // If editing, only show types from the same group as the current question
      const currentType = question.type as keyof typeof checklistTypeGroups
      const typeGroup = checklistTypeGroups[currentType] || []

      // Filter the questionTypes to only include types from the same group
      return questionTypes.filter((type) => typeGroup.includes(type))
    }

    // In create mode or if no question type is set, return all available types
    return questionTypes
  }, [mode, question, questionTypes, checklistTypeGroups])

  const form = useForm<FormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: '',
      type: availableQuestionTypes[0] || questionTypes[0],
      name: '',
      desc: '',
      answerType: undefined,
      min: undefined,
      max: undefined,
      value: undefined,
      subCategoryId: '',
      tags: [],
      images: [],
      docs: [],
      version: 0,
      isLatest: true,
      grade: 'C' as QuestionGrade
    }
  })

  // Optimize form population in edit mode
  useEffect(() => {
    if (mode === 'edit' && question) {
      // Define field mappings for direct properties
      const fieldMappings: Record<string, keyof QuestionCatalog> = {
        id: 'id',
        type: 'type',
        name: 'name',
        desc: 'desc',
        version: 'version',
        isLatest: 'isLatest',
        subCategoryId: 'subCategoryId'
      }

      // Set values for direct properties
      Object.entries(fieldMappings).forEach(([formField, questionField]) => {
        const value = question[questionField]
        if (value !== undefined && value !== null) {
          form.setValue(formField as any, value)
        }
      })

      // Handle special cases with type casting or transformations
      if (question.answerType) {
        form.setValue('answerType', question.answerType as AnswerType)
      }

      if (question.minValue !== undefined && question.minValue !== null) {
        form.setValue('min', question.minValue)
      }
      if (question.maxValue !== undefined && question.maxValue !== null) {
        form.setValue('max', question.maxValue)
      }
      if (question.valueUnit) form.setValue('value', question.valueUnit)

      // Handle arrays with proper type checking
      if (question.images) {
        form.setValue(
          'images',
          Array.isArray(question.images) ? question.images : []
        )
      }

      if (question.docs) {
        form.setValue('docs', Array.isArray(question.docs) ? question.docs : [])
      }

      // Handle tags with type assertion
      if ((question as any).tags) {
        form.setValue('tags', (question as any).tags)
      }

      // Handle grade with type casting
      if (question.grade) {
        form.setValue('grade', question.grade as QuestionGrade)
      }
    }
  }, [mode, question, form, questionTypes])

  useEffect(() => {
    const subCategoryId = form.watch('subCategoryId')

    if (!subCategoryId) {
      setFilteredTags(tags)
      return
    }

    // Filter tags that belong to the selected subcategory
    const filtered = tags.filter((tag) =>
      tag.category?.some((cat) => cat.id === subCategoryId)
    )
    setFilteredTags(filtered)

    // Clear selected tags that don't belong to the new subcategory
    const currentSelectedTags = form.getValues('tags') || []
    if (currentSelectedTags.length > 0) {
      // Get IDs of valid tags for this subcategory
      const validTagIds = new Set(filtered.map((tag) => tag.id))

      // Filter out tags that don't belong to the new subcategory
      const validSelectedTags = currentSelectedTags.filter(
        (tag) => tag && validTagIds.has(tag.id)
      )

      // If some tags were filtered out, update the form value
      if (validSelectedTags.length !== currentSelectedTags.length) {
        form.setValue('tags', validSelectedTags)
      }
    }
  }, [form.watch('subCategoryId'), tags, form])

  // Helper functions for conditional field display
  const shouldShowAnswerType = () => {
    const type = form.watch('type')
    return ['PERIODIC', 'PARTCOP', 'COP', 'TRACING'].includes(type)
  }

  const shouldShowMinMaxFields = () => {
    if (!shouldShowAnswerType()) return false
    const answerType = form.watch('answerType')
    return answerType === 'MinMax' || answerType === 'Barcode'
  }

  const shouldShowValueField = () => form.watch('answerType') === 'MinMax'

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      // Prepare form data with conditional fields
      const formData = {
        ...values,
        id: values.id || `c${uuidv4().replace(/-/g, '').substring(0, 24)}`,
        // Only include conditional fields when they should be shown
        ...(shouldShowAnswerType() ? { answerType: values.answerType } : {}),
        ...(shouldShowMinMaxFields()
          ? {
              min: values.min,
              max: values.max
            }
          : {}),
        ...(shouldShowValueField() ? { value: values.value } : {})
      }

      let result
      if (mode === 'edit') {
        result = await updateQuestion(formData as any)
      } else {
        result = await createQuestion(formData as any)
      }

      if (result.error) {
        toast({
          variant: 'destructive',
          title: '🚨 Error',
          description: result.error
        })
        return
      }

      toast({
        variant: 'success',
        title: mode === 'edit' ? '🎉 Question updated' : '🎉 Question created',
        description:
          mode === 'edit'
            ? 'Question updated successfully'
            : 'Question created successfully'
      })

      router.push('/questions/lists')
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)

      toast({
        variant: 'destructive',
        title: '🚨 Something went wrong!',
        description:
          error instanceof Error
            ? error.message
            : 'Question could not be saved!'
      })
    } finally {
      setLoading(false)
    }
  }

  const { isSubmitting, isValid } = form.formState

  // Benzerlik skoru hesaplama fonksiyonu - çok daha basit ve güçlü
  const calculateSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0

    // Metinleri normalize et
    const normalizeText = (text: string) => {
      return text.toLowerCase().trim().replace(/\s+/g, ' ') // Fazla boşlukları tekil boşluğa çevir
    }

    const text1Normalized = normalizeText(text1)
    const text2Normalized = normalizeText(text2)

    // Tam eşleşme kontrolü - farklı varyasyonlarla
    if (text1Normalized === text2Normalized) {
      return 1.0
    }

    // Basit trim ve case insensitive kontrolü
    if (text1.trim().toLowerCase() === text2.trim().toLowerCase()) {
      return 1.0
    }

    // Metinlerden biri diğerini içeriyorsa
    if (
      text1Normalized.includes(text2Normalized) ||
      text2Normalized.includes(text1Normalized)
    ) {
      return 0.9
    }

    // Kelimelere ayıralım
    const words1 = text1Normalized.split(/\s+/).filter(Boolean)
    const words2 = text2Normalized.split(/\s+/).filter(Boolean)

    // Herhangi bir kelime eşleşiyor mu?
    for (const word1 of words1) {
      if (word1.length < 2) continue // Çok kısa kelimeleri atla

      // Tam kelime eşleşmesi
      if (words2.includes(word1)) {
        return 0.8 // Yüksek benzerlik skoru
      }

      // Kelime içerme kontrolü
      for (const word2 of words2) {
        if (word2.length < 2) continue

        if (word1.includes(word2) || word2.includes(word1)) {
          return 0.7 // Orta derecede benzerlik
        }
      }

      // Herhangi bir metin parçasında yer alıyor mu?
      if (text2Normalized.includes(word1)) {
        return 0.6 // Düşük benzerlik
      }
    }

    // Hiçbir eşleşme yoksa, düşük bir benzerlik değeri döndür
    return 0.1
  }

  // Benzer soruları getiren fonksiyon
  const fetchSimilarQuestions = useCallback(
    debounce(async (searchText: string) => {
      if (searchText.length < 2) {
        // Minimum uzunluğu 2'ye düşürdüm
        setSimilarQuestions([])
        return
      }

      try {
        setIsFetchingSimilar(true)
        // Edit modunda ise, düzenlenen soruyu hariç tut
        const result = await searchSimilarQuestions(
          searchText,
          mode === 'edit' ? question?.id : undefined
        )

        // Benzerlik skorlarını hesapla ve sırala (hiçbir eşik değeri yok)
        const questionsWithScores = result
          .map((question) => {
            const score = calculateSimilarity(searchText, question.name)
            return { ...question, similarityScore: score }
          })
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 5) // En fazla 5 benzer soru göster

        setSimilarQuestions(questionsWithScores)
      } catch (error) {
        console.error('Error fetching similar questions:', error)
      } finally {
        setIsFetchingSimilar(false)
      }
    }, 300), // Debounce süresini 300ms'ye düşürdük (daha hızlı yanıt için)
    [question?.id, mode]
  )

  // Space tuşuna basıldığında veya her 3 saniyede bir arama yapmak için
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const previousValue = form.getValues('name')
    form.setValue('name', value)

    // Edit modunda sadece değer değiştiğinde arama yap
    if (mode === 'edit') {
      if (previousValue === value) {
        return
      }
    }

    // Her karakter değişiminde ara (en az 2 karakter olduğunda)
    if (value.trim().length >= 2) {
      // Direkt olarak ara, debounce olmadan (sorun teşhisi için)
      fetchSimilarQuestionsImmediate(value.trim())
    }
  }

  // İlk yükleme sonrası temizle, otomatik arama olmasın
  useEffect(() => {
    // Form ilk yüklendiğinde benzer soruları temizle
    setSimilarQuestions([])
  }, [])

  // Description alanı için benzer işlemi yapan handler
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const previousValue = form.getValues('desc')
    form.setValue('desc', value)

    // Edit modunda sadece değer değiştiğinde arama yap
    if (mode === 'edit') {
      if (previousValue === value) {
        return
      }
    }

    // Her karakter değişiminde ara (en az 2 karakter olduğunda)
    if (value.trim().length >= 2) {
      const name = form.watch('name')
      const searchText = [name, value.trim()].filter(Boolean).join(' ')
      fetchSimilarQuestionsImmediate(searchText)
    }
  }

  // Sorun teşhisi için debounce olmadan hemen arayan fonksiyon
  const fetchSimilarQuestionsImmediate = async (searchText: string) => {
    if (searchText.length < 2) {
      setSimilarQuestions([])
      return
    }

    try {
      setIsFetchingSimilar(true)

      // Edit modunda ise, düzenlenen soruyu hariç tut
      const result = await searchSimilarQuestions(
        searchText,
        mode === 'edit' ? question?.id : undefined
      )

      if (result.length === 0) {
        setSimilarQuestions([])
        return
      }

      // Edit mode'da yalnızca adı değiştirilmemişse sonuçları atlamayalım
      // Bu, değişiklik yapılmamış sorular için bile benzer soruları göstermemize izin verir
      const nameChanged = mode === 'edit' && searchText !== question?.name
      const skipResults =
        mode === 'edit' && !nameChanged && searchText === question?.name

      // Tam eşleşme kontrolü - doğrudan veritabanından gelen sonuçların ilk öğesini kullan
      // API tarafından döndürülen sonuçların önce tam eşleşmeleri içermesi bekleniyor
      const exactMatches = result.filter(
        (q) =>
          q.name.toLowerCase() === searchText.toLowerCase() ||
          q.name.toLowerCase().trim() === searchText.toLowerCase().trim()
      )

      if (exactMatches.length > 0) {
        // Tam eşleşmeler için benzerlik skorunu 1.0 (100%) olarak ayarla
        exactMatches.forEach((match) => {
          ;(match as any).similarityScore = 1.0
        })
      }

      // Benzerlik skorlarını hesapla ve sırala
      const questionsWithScores = result
        .map((question) => {
          // Eğer skor zaten hesaplanmışsa (exactMatch için) kullan, yoksa hesapla
          const score =
            (question as any).similarityScore ||
            calculateSimilarity(searchText, question.name)
          return { ...question, similarityScore: score }
        })
        // En düşük benzerlik skoru 0.05 olan sonuçları filtrele
        .filter((q) => q.similarityScore >= 0.05)
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 5) // En fazla 5 benzer soru göster

      setSimilarQuestions(questionsWithScores)
    } catch (error) {
      console.error('Error fetching similar questions:', error)
    } finally {
      setIsFetchingSimilar(false)
    }
  }

  // Soru adı veya açıklaması değiştiğinde benzer soruları getir
  useEffect(() => {
    const name = form.watch('name')
    const desc = form.watch('desc') || ''

    // If we've just selected a question, skip the search
    if (justSelectedQuestion.current) {
      justSelectedQuestion.current = false
      return
    }

    // Edit modundaki ilk yüklemeler için değişiklik olup olmadığını kontrol et
    if (mode === 'edit' && question) {
      const initialName = question.name
      const initialDesc = question.desc || ''

      // İsim ve açıklama değişmediyse, benzer soru aramayı atla
      if (name === initialName && desc === initialDesc) {
        return
      }
    }

    // Hem isim hem de açıklama alanlarını dikkate al
    const searchText = [name, desc].filter(Boolean).join(' ')

    if (searchText.length >= 2) {
      // İsim veya açıklama alanlarından en az biri dolu ise benzer soruları getir
      fetchSimilarQuestions(searchText)
    } else {
      setSimilarQuestions([]) // Temizle
    }
  }, [
    form.watch('name'),
    form.watch('desc'),
    fetchSimilarQuestions,
    mode,
    question
  ])

  const handleSelectSimilarQuestion = async (questionId: string) => {
    try {
      setLoading(true)
      // Fetch the complete question data from the database
      const selectedQuestion = await getQuestionCatalogById(questionId)

      if (selectedQuestion) {
        // Set the ref to indicate we've just selected a question
        justSelectedQuestion.current = true

        // Set form values from the selected question
        form.setValue('name', selectedQuestion.name)
        form.setValue('desc', selectedQuestion.desc || '')
        form.setValue('type', selectedQuestion.type)
        form.setValue('subCategoryId', selectedQuestion.subCategoryId)
        form.setValue('grade', selectedQuestion.grade)

        if (selectedQuestion.answerType) {
          form.setValue('answerType', selectedQuestion.answerType)
        }

        if (selectedQuestion.minValue !== null) {
          form.setValue('min', selectedQuestion.minValue)
        }

        if (selectedQuestion.maxValue !== null) {
          form.setValue('max', selectedQuestion.maxValue)
        }

        if (selectedQuestion.valueUnit) {
          form.setValue('value', selectedQuestion.valueUnit)
        }

        // Handle arrays safely
        form.setValue('images', selectedQuestion.images || [])
        form.setValue('docs', selectedQuestion.docs || [])

        // Handle tags properly according to schema
        const formattedTags = selectedQuestion.tags.map((tag) => ({
          id: tag.id,
          name: tag.name
        }))
        form.setValue('tags', formattedTags)

        // Version data
        form.setValue('version', selectedQuestion.version)
        form.setValue('isLatest', selectedQuestion.isLatest)

        if (selectedQuestion.prevId) {
          form.setValue('prevId', selectedQuestion.prevId)
        }

        // Clear similar questions to remove the warning
        setSimilarQuestions([])

        toast({
          variant: 'default',
          title: 'Soru seçildi',
          description: 'Seçtiğiniz soru form alanlarına yüklendi.'
        })
      }
    } catch (error) {
      console.error('Error selecting similar question:', error)
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Soru yüklenirken bir hata oluştu.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-4">
        <Heading
          title={mode === 'create' ? 'Create Question' : 'Edit Question'}
          description={
            mode === 'create'
              ? 'Add a new question to your checklist'
              : 'Edit an existing question'
          }
          icon={<HelpCircle />}
        />

        {/* Soru geçmişi bileşeni (sadece düzenleme modunda) */}
        {mode === 'edit' && question && (
          <div className="flex justify-end">
            <QuestionHistory
              questionId={question.id}
              history={(question as any)?.history || []}
            />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                name="version"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input
                        disabled={true}
                        type="number"
                        placeholder="Enter version"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableQuestionTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.slice(0, 1).toUpperCase() +
                                type.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="subCategoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={isSubmitting}
                            className="w-full justify-between"
                          >
                            <span className="truncate text-left">
                              {field.value
                                ? `${
                                    subCategories?.find(
                                      (category) => category.id === field.value
                                    )?.name || ''
                                  } / ${
                                    subCategories?.find(
                                      (category) => category.id === field.value
                                    )?.mainCategory || 'Select category'
                                  }`
                                : 'Select category'}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] max-h-[300px] overflow-y-auto p-0">
                          <Command>
                            <CommandInput placeholder="Search by category or subcategory..." />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {subCategories?.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={`${category.name} ${
                                      category.mainCategory || ''
                                    }`}
                                    onSelect={() => {
                                      form.setValue(
                                        'subCategoryId',
                                        category.id
                                      )
                                      setOpen(false)
                                    }}
                                    className="flex items-center truncate"
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4 flex-shrink-0',
                                        category.id === field.value
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <span className="truncate">
                                      {category.name} / {category.mainCategory}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Name</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="Enter question name"
                        {...field}
                        onChange={handleNameChange}
                      />
                    </FormControl>
                    {isFetchingSimilar && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span
                          className="animate-spin inline-block h-4 w-4 border-2 border-current border-t-transparent text-primary rounded-full"
                          aria-hidden="true"
                        ></span>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Benzer sorular bileşeni */}
            {similarQuestions.length > 0 && (
              <SimilarQuestionsAlert
                similarQuestions={similarQuestions}
                onSelectQuestion={handleSelectSimilarQuestion}
              />
            )}

            <FormField
              name="desc"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-1.5">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="Enter detailed description"
                      {...field}
                      onChange={handleDescChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="grade"
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        value={field.value || (question?.grade as string)}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(QuestionGrade).map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {shouldShowAnswerType() && (
              <FormField
                name="answerType"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel>Answer Type</FormLabel>
                    <FormControl>
                      <Select
                        disabled={isSubmitting}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select an answer type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AnswerType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {shouldShowMinMaxFields() && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="min"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel>Minimum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="Enter minimum value"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="max"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel>Maximum Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isSubmitting}
                          placeholder="Enter maximum value"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseInt(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {shouldShowValueField() && (
                  <FormField
                    name="value"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isSubmitting}
                            placeholder="Enter value"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              name="tags"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiketler</FormLabel>
                  <FormControl>
                    <TagsInput
                      availableTags={filteredTags}
                      allTags={tags}
                      selectedTags={field.value
                        .map((tag) => tag?.id)
                        .filter(Boolean)}
                      onTagsChange={(selectedTagIds) => {
                        // Find tag objects for selected IDs
                        const selectedTagObjects = selectedTagIds
                          .map((id) => {
                            // First try to find in filtered tags
                            const filteredTag = filteredTags.find(
                              (tag) => tag.id === id
                            )
                            if (filteredTag) return filteredTag

                            // If not found, look in all tags
                            return tags.find((tag) => tag.id === id)
                          })
                          .filter(Boolean)

                        field.onChange(selectedTagObjects)
                      }}
                      selectedSubCategoryId={form.watch('subCategoryId')}
                      subcategories={subCategories}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'edit' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          <h3 className="font-medium">Images</h3>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={isSubmitting}
                          onChange={async (e) => {
                            try {
                              const files = e.target.files
                              if (!files?.length) return

                              const uploadedUrls: string[] = []

                              for (const file of Array.from(files)) {
                                // Check file size (50MB limit)
                                if (file.size > 50 * 1024 * 1024) {
                                  throw new Error(
                                    `File ${file.name} exceeds the 50MB size limit`
                                  )
                                }

                                const filePath = `images/${Date.now()}-${
                                  file.name
                                }`
                                const { data, error } = await supabase.storage
                                  .from('images')
                                  .upload(filePath, file, {
                                    cacheControl: '3600',
                                    upsert: false,
                                    contentType: file.type
                                  })

                                if (error) {
                                  console.error('Supabase upload error:', error)
                                  throw new Error(
                                    `Failed to upload ${file.name}: ${error.message}`
                                  )
                                }

                                const { data: urlData } = supabase.storage
                                  .from('images')
                                  .getPublicUrl(data.path)

                                uploadedUrls.push(urlData.publicUrl)
                              }

                              const currentImages =
                                form.getValues('images') || []
                              form.setValue('images', [
                                ...currentImages,
                                ...uploadedUrls
                              ])

                              toast({
                                title: '✅ Success',
                                description: 'Images uploaded successfully'
                              })
                            } catch (error) {
                              console.error('Upload error:', error)
                              toast({
                                variant: 'destructive',
                                title: '🚨 Error',
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : 'Failed to upload files'
                              })
                            }
                          }}
                          className="cursor-pointer"
                        />
                        {form.watch('images')?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {form.watch('images').map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Upload ${index + 1}`}
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                                <Button
                                  variant="ghost"
                                  type="button"
                                  onClick={() => {
                                    const currentImages =
                                      form.getValues('images')
                                    form.setValue(
                                      'images',
                                      currentImages.filter(
                                        (_, i) => i !== index
                                      )
                                    )
                                  }}
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-background border hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-indigo-500" />
                          <h3 className="font-medium">Documents</h3>
                        </div>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          multiple
                          disabled={isSubmitting}
                          onChange={async (e) => {
                            try {
                              const files = e.target.files
                              if (!files?.length) return

                              const uploadedUrls: string[] = []

                              for (const file of Array.from(files)) {
                                // Check file size (50MB limit)
                                if (file.size > 50 * 1024 * 1024) {
                                  throw new Error(
                                    `File ${file.name} exceeds the 50MB size limit`
                                  )
                                }

                                const filePath = `docs/${Date.now()}-${
                                  file.name
                                }`
                                const { data, error } = await supabase.storage
                                  .from('images')
                                  .upload(filePath, file, {
                                    cacheControl: '3600',
                                    upsert: false,
                                    contentType: file.type
                                  })

                                if (error) {
                                  console.error('Supabase upload error:', error)
                                  throw new Error(
                                    `Failed to upload ${file.name}: ${error.message}`
                                  )
                                }

                                const { data: urlData } = supabase.storage
                                  .from('images')
                                  .getPublicUrl(data.path)

                                uploadedUrls.push(urlData.publicUrl)
                              }

                              const currentDocs = form.getValues('docs') || []
                              form.setValue('docs', [
                                ...currentDocs,
                                ...uploadedUrls
                              ])

                              toast({
                                title: '✅ Success',
                                description: 'Documents uploaded successfully'
                              })
                            } catch (error) {
                              console.error('Upload error:', error)
                              toast({
                                variant: 'destructive',
                                title: '🚨 Error',
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : 'Failed to upload files'
                              })
                            }
                          }}
                          className="cursor-pointer"
                        />
                        {form.watch('docs')?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {form.watch('docs').map((doc, index) => (
                              <div key={index} className="relative group">
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                                  <FileText className="h-4 w-4" />
                                  <span className="text-sm truncate max-w-[150px]">
                                    {doc.split('/').pop()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentDocs = form.getValues('docs')
                                      form.setValue(
                                        'docs',
                                        currentDocs.filter(
                                          (_, i) => i !== index
                                        )
                                      )
                                    }}
                                    className="p-1 rounded-full hover:bg-destructive/90 hover:text-destructive-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-x-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {mode === 'create' ? 'Create Question' : 'Update Question'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
