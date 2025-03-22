'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  Upload,
  X,
  Info,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Clipboard
} from 'lucide-react'
import Image from 'next/image'
import VehicleInfo from '../vehicle-info'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import {
  ChecklistQuestions,
  QuestionCatalog,
  FailureSubCategory,
  FailureCategory,
  SimulatorStatus
} from '@prisma/client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import ManualErrorEntryModal from '../manual-error-entry-modal'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

type QuestionWithDetails = ChecklistQuestions & {
  question: QuestionCatalog & {
    subCategory: FailureSubCategory & {
      mainCategory: FailureCategory
    }
  }
}

interface SimulatorQuestionsProps {
  simulator: {
    id: string
    createdAt: Date
    updatedAt: Date
    status: SimulatorStatus
    itemNo: string
    pointsId: string
    checklistsId: string
    model: string
    chassisNo: string
    fertNo: string
    zobasNo: string
    country: string
    checklists: {
      questions: ChecklistQuestions[]
    }
  }
  questions: QuestionWithDetails[]
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SimulatorQuestions({
  simulator,
  questions
}: SimulatorQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionWithDetails | null>(questions[0] || null)
  const [explanation, setExplanation] = useState('')
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({})
  const [expandedSubCategories, setExpandedSubCategories] = useState<
    Record<string, boolean>
  >({})

  useEffect(() => {
    setMounted(true)

    // Initialize all categories as expanded
    const initialExpandedCategories: Record<string, boolean> = {}
    const initialExpandedSubCategories: Record<string, boolean> = {}

    questions.forEach((question) => {
      const mainCategoryId = question.question.subCategory.mainCategory.id
      const subCategoryId = question.question.subCategory.id

      initialExpandedCategories[mainCategoryId] = true
      initialExpandedSubCategories[subCategoryId] = true
    })

    setExpandedCategories(initialExpandedCategories)
    setExpandedSubCategories(initialExpandedSubCategories)
  }, [questions])

  // Group questions by main category and subcategory
  const groupedQuestions = questions.reduce(
    (acc, question) => {
      const mainCategory = question.question.subCategory.mainCategory
      const subCategory = question.question.subCategory

      if (!acc[mainCategory.id]) {
        acc[mainCategory.id] = {
          name: mainCategory.name,
          subCategories: {},
          count: 0
        }
      }

      if (!acc[mainCategory.id].subCategories[subCategory.id]) {
        acc[mainCategory.id].subCategories[subCategory.id] = {
          name: subCategory.name,
          questions: [],
          count: 0
        }
      }

      acc[mainCategory.id].subCategories[subCategory.id].questions.push(
        question
      )
      acc[mainCategory.id].subCategories[subCategory.id].count += 1
      acc[mainCategory.id].count += 1
      return acc
    },
    {} as Record<
      string,
      {
        name: string
        count: number
        subCategories: Record<
          string,
          {
            name: string
            count: number
            questions: QuestionWithDetails[]
          }
        >
      }
    >
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategories((prev) => ({
      ...prev,
      [subCategoryId]: !prev[subCategoryId]
    }))
  }

  const handleAnswerChange = (value: 'OK' | 'NA' | 'NG') => {
    if (selectedQuestion) {
      // If NG is selected, open the manual error entry modal
      if (value === 'NG') {
        setIsErrorModalOpen(true)
      }

      setAnswers((prev) => ({
        ...prev,
        [selectedQuestion.questionId]: value
      }))
    }
  }

  const handleSubmit = async () => {
    // Save the current question's data
    if (selectedQuestion) {
      // Here you would implement the logic to save the data
      console.log('Saving data for question:', selectedQuestion.questionId)
      console.log('Answer:', answers[selectedQuestion.questionId])
      console.log('Explanation:', explanation)
      console.log('Photos:', photos)
    }
  }

  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const files = e.target.files
      if (!files?.length) return

      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds the 50MB size limit`)
        }

        // Only accept image files
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`)
        }

        const filePath = `images/${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          })

        if (error) {
          console.error('Supabase upload error:', error)
          throw new Error(`Failed to upload ${file.name}: ${error.message}`)
        }

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.path)

        uploadedUrls.push(urlData.publicUrl)
      }

      setPhotos((prev) => [...prev, ...uploadedUrls])
      toast({
        title: '✅ Success',
        description: 'Photos uploaded successfully'
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: 'destructive',
        title: '🚨 Error',
        description:
          error instanceof Error ? error.message : 'Failed to upload photos'
      })
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleErrorModalClose = () => {
    setIsErrorModalOpen(false)
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-400'
    switch (status) {
      case 'OK':
        return 'bg-green-600'
      case 'NA':
        return 'bg-yellow-500'
      case 'NG':
        return 'bg-destructive'
      default:
        return 'bg-gray-400'
    }
  }

  if (!mounted) return null

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[800px] rounded-lg border"
      >
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex h-full flex-col">
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Kontrol Listesi</h2>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {Object.entries(groupedQuestions).map(
                ([mainCategoryId, mainCategory]) => (
                  <Collapsible
                    key={mainCategoryId}
                    open={expandedCategories[mainCategoryId]}
                    className="border-b"
                  >
                    <CollapsibleTrigger
                      className="flex items-center w-full p-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleCategory(mainCategoryId)}
                    >
                      {expandedCategories[mainCategoryId] ? (
                        <ChevronDown className="h-4 w-4 mr-2 text-indigo-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2 text-indigo-500" />
                      )}
                      <span className="font-medium text-md">
                        {mainCategory.name} ({mainCategory.count})
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {Object.entries(mainCategory.subCategories).map(
                        ([subCategoryId, subCategory]) => (
                          <Collapsible
                            key={subCategoryId}
                            open={expandedSubCategories[subCategoryId]}
                            className="pl-4"
                          >
                            <CollapsibleTrigger
                              className="flex items-center w-full p-2 hover:bg-muted/30 cursor-pointer"
                              onClick={() => toggleSubCategory(subCategoryId)}
                            >
                              {expandedSubCategories[subCategoryId] ? (
                                <ChevronDown className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 mr-2 text-indigo-400" />
                              )}
                              <span className="text-sm text-muted-foreground">
                                {subCategory.name} ({subCategory.count})
                              </span>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              {subCategory.questions.map((q) => (
                                <div
                                  key={q.questionId}
                                  className={cn(
                                    'flex items-center gap-2 py-2 px-4 pl-8 cursor-pointer hover:bg-accent transition-colors',
                                    selectedQuestion?.questionId ===
                                      q.questionId
                                      ? 'bg-accent'
                                      : ''
                                  )}
                                  onClick={() => setSelectedQuestion(q)}
                                >
                                  <div
                                    className={cn(
                                      'h-2 w-2 rounded-full',
                                      getStatusColor(answers[q.questionId])
                                    )}
                                  />
                                  <p className="text-sm">{q.question.name}</p>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-semibold">Araç Bilgileri</h2>
              </div>
              <VehicleInfo
                vehicleInfo={{
                  model: simulator.model || '',
                  chassisNo: simulator.chassisNo || '',
                  fertNo: simulator.fertNo || '',
                  zobasNo: simulator.zobasNo || '',
                  country: simulator.country || ''
                }}
              />
            </div>
            {selectedQuestion && (
              <div className="flex-1 p-4 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        <CardTitle className="text-lg">
                          Soru Detayları
                        </CardTitle>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <p className="text-black font-medium">Kategori:</p>
                          {
                            selectedQuestion.question.subCategory.mainCategory
                              .name
                          }
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <p className="text-black font-medium">
                            Alt kategori:
                          </p>
                          {selectedQuestion.question.subCategory.name}
                        </div>
                        {selectedQuestion.question.images.length > 0 ? (
                          <div className="w-full rounded-md items-center justify-center flex">
                            <Carousel
                              opts={{ align: 'center' }}
                              className="w-full"
                            >
                              <CarouselContent>
                                {selectedQuestion.question.images.map(
                                  (image) => (
                                    <CarouselItem
                                      key={image}
                                      className="basis-full"
                                    >
                                      <div className="p-2">
                                        <Card className="border-0 shadow-none bg-transparent">
                                          <CardContent className="flex items-center justify-center p-0">
                                            <Image
                                              src={image}
                                              alt={
                                                selectedQuestion.question.name
                                              }
                                              width={300}
                                              height={0}
                                              priority={true}
                                              className="object-contain max-h-[300px] rounded-md"
                                              style={{
                                                width: '100%',
                                                height: 'auto'
                                              }}
                                            />
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </CarouselItem>
                                  )
                                )}
                              </CarouselContent>
                              <CarouselPrevious className="left-2" />
                              <CarouselNext className="right-2" />
                            </Carousel>
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-md bg-gray-200 items-center justify-center flex">
                            <p className="text-muted-foreground">Resim yok</p>
                          </div>
                        )}
                        <div className="mt-2 font-medium">
                          {selectedQuestion.question.name}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <HelpCircle className="h-5 w-5 text-indigo-500" />
                          <h3 className="font-medium">Cevabınızı Seçin</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            key="OK"
                            variant={
                              answers[selectedQuestion?.questionId] === 'OK'
                                ? 'success'
                                : 'outline'
                            }
                            className="w-full"
                            onClick={() => handleAnswerChange('OK')}
                          >
                            <CheckCircle
                              className={cn(
                                'mr-2 h-4 w-4',
                                answers[selectedQuestion?.questionId] === 'OK'
                                  ? 'text-white'
                                  : 'text-green-600'
                              )}
                            />
                            OK
                          </Button>
                          <Button
                            key="NA"
                            variant={
                              answers[selectedQuestion?.questionId] === 'NA'
                                ? 'warning'
                                : 'outline'
                            }
                            className="w-full"
                            onClick={() => handleAnswerChange('NA')}
                          >
                            <HelpCircle
                              className={cn(
                                'mr-2 h-4 w-4',
                                answers[selectedQuestion?.questionId] === 'NA'
                                  ? 'text-white'
                                  : 'text-yellow-500'
                              )}
                            />
                            N/A
                          </Button>
                          <Button
                            key="NG"
                            variant={
                              answers[selectedQuestion?.questionId] === 'NG'
                                ? 'destructive'
                                : 'outline'
                            }
                            className="w-full"
                            onClick={() => handleAnswerChange('NG')}
                          >
                            <AlertCircle
                              className={cn(
                                'mr-2 h-4 w-4',
                                answers[selectedQuestion?.questionId] === 'NG'
                                  ? 'text-white'
                                  : 'text-destructive'
                              )}
                            />
                            NG
                          </Button>
                        </div>
                      </div>

                      {/* Only show these fields for OK and N/A responses */}
                      {answers[selectedQuestion.questionId] &&
                        answers[selectedQuestion.questionId] !== 'NG' && (
                          <div className="space-y-4">
                            {/* Photo upload section */}
                            <Card className="p-4">
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <Camera className="h-5 w-5 text-indigo-500" />
                                  <h3 className="font-medium">
                                    Fotoğraf ekleyin
                                  </h3>
                                </div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  disabled={uploading}
                                  onChange={handleUploadPhotos}
                                  className="cursor-pointer"
                                />
                                {photos.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {photos.map((photo, index) => (
                                      <div
                                        key={index}
                                        className="relative group"
                                      >
                                        <img
                                          src={photo}
                                          alt={`Upload ${index + 1}`}
                                          className="w-20 h-20 object-cover rounded-md"
                                        />
                                        <Button
                                          variant="ghost"
                                          type="button"
                                          onClick={() => removePhoto(index)}
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
                                  <Clipboard className="h-5 w-5 text-indigo-500" />
                                  <h3 className="font-medium">Açıklama ekle</h3>
                                </div>
                                <Textarea
                                  value={explanation}
                                  onChange={(e) =>
                                    setExplanation(e.target.value)
                                  }
                                  placeholder="Açıklama girin..."
                                  className="min-h-[100px]"
                                />
                              </div>
                            </Card>

                            <Button
                              variant="default"
                              className="w-full bg-indigo-500 hover:bg-indigo-600"
                              onClick={handleSubmit}
                            >
                              Kaydet
                            </Button>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Manual Error Entry Modal for NG responses */}
      <ManualErrorEntryModal
        isOpen={isErrorModalOpen}
        onClose={handleErrorModalClose}
        vehicleInfo={{
          model: simulator.model || '',
          chassisNo: simulator.chassisNo || '',
          fertNo: simulator.fertNo || '',
          zobasNo: simulator.zobasNo || '',
          country: simulator.country || ''
        }}
      />
    </>
  )
}
