import QuestionsListsClient from '@/app/(qualisu)/questions/lists/client'
import { getQuestionCatalog } from '@/features/questions/api/server-actions'

const QuestionsListsPage = async () => {
  const questions = await getQuestionCatalog()

  if (!questions) {
    return <div>No questions data available</div>
  }

  return (
    <div className="h-full">
      <QuestionsListsClient questions={questions as any} />
    </div>
  )
}

export default QuestionsListsPage
