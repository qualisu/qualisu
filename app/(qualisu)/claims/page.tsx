import ClaimsClient from '@/app/(qualisu)/claims/client'
import { getClaims } from '@/features/claims/api/server-actions'

const ClaimsPage = async () => {
  const claims = await getClaims()

  return (
    <div className="h-full">
      <ClaimsClient claims={claims as any} />
    </div>
  )
}

export default ClaimsPage
