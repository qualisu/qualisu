'use client'

import { Answers } from '@prisma/client'
import { QuestionsColumn } from '../../questions/questions-columns'
import AnswerForm from './answer-form'

interface ClientProps {
  questions: QuestionsColumn[]
  simulator: string
  answers: Answers[]
}

export default function Client({ questions, simulator, answers }: ClientProps) {
  return (
    <AnswerForm questions={questions} simulator={simulator} answers={answers} />
  )
}
