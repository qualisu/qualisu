'use client'

import Image from 'next/image'
import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Trash } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'

import DecisionButtons from '@/components/decision-buttons'
import { Textarea } from '@/components/ui/textarea'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import VehicleInfo from '@/app/(qualisu)/simulators/vehicle-info'
import { Button } from '@/components/ui/button'
import QuestionBar from './question-bar'
import { QuestionsColumn } from '../../checklists/questions/questions-columns'
import { FormProvider, useForm } from 'react-hook-form'
import { useToast } from '@/components/ui/use-toast'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { UploadDropzone } from '@/components/uploadthing'
import {
  createAnswer,
  finishSimulators
} from '@/features/simulators/api/server-actions'
import { Answers } from '@prisma/client'

interface AnswerFormProps {
  questions: QuestionsColumn[]
  simulator: string
  answers: Answers[]
}

export const answerSchema = z.object({
  simulator: z.string().optional(),
  checklistId: z.string().optional(),
  questionId: z.string().optional(),
  answer: z.string().min(1, { message: 'Answer is required' }),
  images: z.array(z.string()),
  description: z.string().min(1, { message: 'Description is required' })
})

export type AnswerFormValues = z.infer<typeof answerSchema>

export default function AnswerForm({
  questions,
  simulator,
  answers
}: AnswerFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [images, setImages] = useState<string[]>([])
  const [imageDeleting, setImageDeleting] = useState<boolean>(false)

  const [answer, setAnswer] = useState<Record<string, AnswerFormValues>>(
    answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer
      return acc
    }, {} as Record<string, AnswerFormValues>)
  )
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)

  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionsColumn | null>(questions.length > 0 ? questions[0] : null)

  useEffect(() => {
    setSelectedQuestion(questions.length > 0 ? questions[0] : null)
  }, [questions])

  const decisionButtonsRef = useRef<{ reset: () => void } | null>(null)

  const handleQuestionSelect = (question: QuestionsColumn) => {
    const newIndex = questions.findIndex((q) => q.id === question.id)
    setCurrentQuestionIndex(newIndex)
    setSelectedQuestion(question)

    // Load previous answer if exists
    const previousAnswer = answer[question.id]
    if (previousAnswer) {
      form.reset(previousAnswer)
      setImages(previousAnswer.images || [])
      decisionButtonsRef.current?.reset()
      setTimeout(() => form.setValue('answer', previousAnswer.answer), 0)
    } else {
      form.reset({
        answer: '',
        images: [],
        description: ''
      })
      setImages([])
      decisionButtonsRef.current?.reset()
    }
  }

  const handleDeleteImage = async (image: string, index: number) => {
    setImageDeleting(true)
    const imageKey = image.substring(image.lastIndexOf('/') + 1)
    try {
      const res = await axios.post('/api/uploadthing/delete', { imageKey })
      if (res.data.success) {
        const updatedImages = images.filter((_, i) => i !== index)
        setImages(updatedImages)
        form.setValue('images', updatedImages)
        toast({
          variant: 'success',
          title: '🎉 Vehicle model image deleted',
          description: 'Vehicle model image deleted successfully'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Something was wrong!',
        description: 'Vehicle model image did not delete!'
      })
    } finally {
      setImageDeleting(false)
    }
  }

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      checklistId: params.id,
      questionId: '',
      answer: answer[selectedQuestion?.id || '']?.answer || '',
      images: answer[selectedQuestion?.id || '']?.images || [],
      description: answer[selectedQuestion?.id || '']?.description || ''
    }
  })

  const onSubmit = async (values: AnswerFormValues) => {
    try {
      const currentQuestionId = selectedQuestion?.id || ''

      setAnswer((prev) => ({
        ...prev,
        [currentQuestionId]: values
      }))

      const result = await createAnswer({
        questionId: currentQuestionId,
        answer: values.answer,
        images: values.images,
        description: values.description,
        simulator
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      if (currentQuestionIndex < questions.length - 1) {
        const nextQuestion = questions[currentQuestionIndex + 1]
        handleQuestionSelect(nextQuestion)
        questionBarRef.current?.updateSelectedQuestion(nextQuestion.id)
        decisionButtonsRef.current?.reset()
      } else {
        toast({
          variant: 'success',
          title: '🎉 All answers submitted',
          description: 'All questions have been answered successfully'
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Error Message',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while saving the answer.'
      })
    }
  }

  const onFinished = async () => {
    try {
      await finishSimulators(simulator)
      router.push('/simulators')
    } catch (error) {
      console.log(error)
    }
  }

  const { isSubmitting, isValid } = form.formState

  const questionBarRef = useRef<{
    updateSelectedQuestion: (questionId: string) => void
  }>(null)

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel minSize={22} defaultSize={24} className="px-2">
        <QuestionBar
          currentQuestionIndex={currentQuestionIndex}
          ref={questionBarRef}
          questions={questions}
          onQuestionSelect={handleQuestionSelect}
          answers={answer}
          onSubmit={onFinished}
          isValid={isValid}
          isSubmitting={isSubmitting}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={60}
        defaultSize={60}
        className="px-2 py-1 space-y-2"
      >
        <VehicleInfo />
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid space-y-8"
          >
            {selectedQuestion && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Kategori:
                      <span className="text-muted-foreground ml-2">
                        {selectedQuestion.category}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Alt Kategori:
                      <span className="text-muted-foreground ml-2">
                        {selectedQuestion.subCategory}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
                <div className="flex justify-center">
                  <Carousel className="w-full max-w-sm">
                    <CarouselContent className="-ml-1 space-x-2">
                      {selectedQuestion.images.map((img, index) => (
                        <CarouselItem key={index} className="pl-1  basis-1/2">
                          <Card className="flex items-center justify-center h-62 w-full">
                            <CardContent className="flex aspect-square items-center justify-center px-2 py-1">
                              <Image
                                src={img}
                                alt={selectedQuestion.name}
                                className="h-48 w-48 object-contain transition-all hover:scale-105"
                                width={50}
                                height={50}
                              />
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
                <FormField
                  name="answer"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Decision</FormLabel>
                      <FormControl>
                        <DecisionButtons
                          ref={decisionButtonsRef}
                          onSelect={(value) => field.onChange(value)}
                          initialValue={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="images"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="px-2 py-1 grid grid-cols-1 gap-4">
                      <FormLabel className="text-sm font-bold">
                        Question Image(s)
                      </FormLabel>
                      <FormControl>
                        {field.value.length > 0 ? (
                          <>
                            <div className="mb-4 flex items-center gap-4">
                              <div className="flex space-x-2">
                                {field.value.map((image, index) => (
                                  <div
                                    key={index}
                                    className="flex relative border-2 border-gray-100 rounded-md p-1"
                                  >
                                    <div className="z-10 absolute top-2 right-2">
                                      <Button
                                        className="absolute top-0 right-0"
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() =>
                                          handleDeleteImage(image, index)
                                        }
                                      >
                                        {imageDeleting ? (
                                          <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                          <Trash className="size-4" />
                                        )}
                                      </Button>
                                    </div>
                                    <Image
                                      key={index}
                                      width={200}
                                      height={200}
                                      src={image}
                                      alt="Vehicle model image"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <UploadDropzone
                              endpoint="answerImage"
                              onClientUploadComplete={(res) => {
                                const uploadedImages = res.map(
                                  (item) => item.url
                                )
                                setImages(uploadedImages)
                                field.onChange(uploadedImages)
                                toast({
                                  title: '🚀 Image uploaded successfully!',
                                  description:
                                    'Your image has been uploaded to the server.'
                                })
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  variant: 'destructive',
                                  title: '🚨 Something was wrong!',
                                  description: `ERROR! ${error.message}`
                                })
                              }}
                            />
                          </>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="px-2 py-1">
                      <FormLabel className="text-sm font-bold">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={isSubmitting}
                          placeholder="Ör. Hata devam ediyor..."
                          className="bg-muted-foreground/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => router.push('/simulators')}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    disabled={!isValid || isSubmitting}
                  >
                    {currentQuestionIndex === questions.length - 1
                      ? 'Finish'
                      : 'Next Question'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </FormProvider>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
