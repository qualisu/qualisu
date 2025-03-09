'use client'

import { AnswerType, QuestionCatalog } from '@prisma/client'
import { Tags } from '@prisma/client'
import { QuestionGrade } from '@prisma/client'
import { ChecklistTypes } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'

export type QuestionsColumn = {
  id: string
  name: string
  desc: string
  type: ChecklistTypes
  grade: QuestionGrade
  tags: Tags[]
  images: string[]
  docs: string[]
  version: number
  isLatest: boolean
  prevId: string
  prev: QuestionCatalog
  next: QuestionCatalog
  answerType: AnswerType
  minValue?: number
  maxValue?: number
  valueUnit?: string
}

export const columns: ColumnDef<QuestionsColumn>[] = []
