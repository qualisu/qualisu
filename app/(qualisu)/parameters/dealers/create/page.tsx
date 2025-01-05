import { DealersColumn } from '@/app/(qualisu)/parameters/dealers/dealers-columns'
import { getDealerById } from '@/features/parameters/dealers/api/server-actions'
import DealerForm from '@/features/parameters/dealers/components/dealers-form'

interface Props {
  searchParams: {
    id?: string
  }
}
export default async function CreatePage({ searchParams }: Props) {
  const dealer = await getDealerById(searchParams.id ?? '')

  if (!dealer) {
    return <div>No data found</div>
  }

  return (
    <div className="px-2">
      <DealerForm initialData={dealer as DealersColumn} id={searchParams.id} />
    </div>
  )
}
