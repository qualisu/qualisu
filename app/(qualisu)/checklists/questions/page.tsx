import { QuestionsColumn } from './questions-columns'
import QuestionsClient from './client'
import { getQuestions } from '@/features/checklists/questions/api/server-actions'

const QuestionPage = async () => {
  const questions = await getQuestions()

  if (!questions) {
    return <div>No data found</div>
  }

  return <QuestionsClient questions={questions as QuestionsColumn[]} />
}

export default QuestionPage
