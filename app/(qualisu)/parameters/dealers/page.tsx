import DealersClient from '@/app/(qualisu)/parameters/dealers/client'
import { getDealers } from '@/features/parameters/dealers/api/server-actions'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'

const DealersPage = async () => {
  const dealers = await getDealers()

  if (!dealers) {
    return <div>No data found</div>
  }

  return <DealersClient dealers={dealers as DealersColumn[]} />
}

export default DealersPage
