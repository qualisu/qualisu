'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Camera } from 'lucide-react'
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

export default function SimulatorQuestions({
  simulator,
  questions
}: SimulatorQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionWithDetails | null>(questions[0] || null)
  const [explanation, setExplanation] = useState('')
  const [isClassifying, setIsClassifying] = useState(false)
  const [classifiedQuestion, setClassifiedQuestion] =
    useState<QuestionWithDetails | null>(null)

  // Group questions by main category and subcategory
  const groupedQuestions = questions.reduce(
    (acc, question) => {
      const mainCategory = question.question.subCategory.mainCategory
      const subCategory = question.question.subCategory

      if (!acc[mainCategory.id]) {
        acc[mainCategory.id] = {
          name: mainCategory.name,
          subCategories: {}
        }
      }

      if (!acc[mainCategory.id].subCategories[subCategory.id]) {
        acc[mainCategory.id].subCategories[subCategory.id] = {
          name: subCategory.name,
          questions: []
        }
      }

      acc[mainCategory.id].subCategories[subCategory.id].questions.push(
        question
      )
      return acc
    },
    {} as Record<
      string,
      {
        name: string
        subCategories: Record<
          string,
          {
            name: string
            questions: QuestionWithDetails[]
          }
        >
      }
    >
  )

  const handleAnswerChange = (value: 'OK' | 'NA' | 'NG') => {
    if (selectedQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [selectedQuestion.questionId]: value
      }))
    }
  }

  const handleSubmit = async () => {}

  const answerButtons = [
    { value: 'OK', label: 'OK', variant: 'success' as const },
    { value: 'NA', label: 'N/A', variant: 'secondary' as const },
    { value: 'NG', label: 'NG', variant: 'destructive' as const }
  ]

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[800px] rounded-lg border"
    >
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Kontrol Listesi</h2>
          </div>
          <div className="flex-1 overflow-auto">
            {Object.entries(groupedQuestions).map(
              ([mainCategoryId, mainCategory]) => (
                <div key={mainCategoryId} className="border-b">
                  <div className="p-3 bg-muted font-medium">
                    {mainCategory.name}
                  </div>
                  {Object.entries(mainCategory.subCategories).map(
                    ([subCategoryId, subCategory]) => (
                      <div key={subCategoryId} className="pl-3">
                        <div className="p-2 text-sm text-muted-foreground bg-muted/50">
                          {subCategory.name}
                        </div>
                        {subCategory.questions.map((q) => (
                          <div
                            key={q.questionId}
                            className={`p-3 pl-4 border-b cursor-pointer hover:bg-accent ${
                              selectedQuestion?.questionId === q.questionId
                                ? 'bg-accent'
                                : ''
                            } ${
                              answers[q.questionId] === 'NG'
                                ? 'border-l-4 border-l-destructive'
                                : answers[q.questionId] === 'OK'
                                ? 'border-l-4 border-l-green-600'
                                : 'border-l-4 border-l-gray-500'
                            }`}
                            onClick={() => setSelectedQuestion(q)}
                          >
                            <p className="text-sm">{q.question.name}</p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
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
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <p className="text-black font-medium">Kategori:</p>
                      {selectedQuestion.question.subCategory.mainCategory.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <p className="text-black font-medium">Alt kategori:</p>
                      {selectedQuestion.question.subCategory.name}
                    </div>
                    {selectedQuestion.question.images.length > 0 ? (
                      <Image
                        className="w-1/2"
                        src={selectedQuestion.question.images[0]}
                        alt={selectedQuestion.question.name}
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="w-full h-40 rounded-md bg-gray-200 items-center justify-center flex">
                        <Carousel
                          opts={{ align: 'start' }}
                          className="w-full max-w-sm"
                        >
                          <CarouselContent>
                            {selectedQuestion.question.images.map((image) => (
                              <CarouselItem
                                key={image}
                                className="md:basis-1/2 lg:basis-1/3"
                              >
                                <div className="p-1">
                                  <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-6">
                                      <Image
                                        src={image}
                                        alt={selectedQuestion.question.name}
                                        width={100}
                                        height={100}
                                      />
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                      </div>
                    )}
                    <CardTitle className="text-lg">
                      {selectedQuestion.question.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {answerButtons.map((button) => (
                      <Button
                        key={button.value}
                        variant={
                          answers[selectedQuestion?.questionId] === button.value
                            ? button.variant
                            : 'outline'
                        }
                        className="w-full"
                        onClick={() =>
                          handleAnswerChange(button.value as 'OK' | 'NA' | 'NG')
                        }
                      >
                        {button.label}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Button variant="outline" className="w-full">
                        <Camera className="mr-2 h-4 w-4" />
                        Fotoğraf ekleyin
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Açıklama ekle</Label>
                      <Textarea
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Açıklama girin..."
                      />
                    </div>
                    <Button
                      variant={
                        classifiedQuestion === selectedQuestion
                          ? 'default'
                          : 'outline'
                      }
                      className="w-full"
                      onClick={handleSubmit}
                      disabled={isClassifying || !explanation.trim()}
                    >
                      {isClassifying
                        ? 'Sınıflandırılıyor...'
                        : 'Kategorilendir'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
