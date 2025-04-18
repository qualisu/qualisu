import DealersClient from '@/app/(qualisu)/parameters/dealers/client'
import { getDealers } from '@/features/parameters/dealers/api/server-actions'
import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/columns'

const DealersPage = async () => {
  const dealers = await getDealers()

  return <DealersClient dealers={dealers as DealersColumn[]} />
}

export default DealersPage
