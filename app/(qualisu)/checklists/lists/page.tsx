import ChecklistClient from './client'
import { getChecklists } from '@/features/questions/api/server-actions'

const ChecklistPage = async () => {
  const checklists = await getChecklists()

  return <ChecklistClient checklists={checklists as any[]} />
}

export default ChecklistPage
