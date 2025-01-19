import ChecklistClient from './client'
import { getChecklists } from '@/features/checklists/questions/api/server-actions'

const ChecklistPage = async () => {
  const checklists = await getChecklists()

  if (!checklists) {
    return <div>No data found</div>
  }

  return <ChecklistClient checklists={checklists as any[]} />
}

export default ChecklistPage
