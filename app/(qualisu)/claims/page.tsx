import ClaimsClient from '@/app/(qualisu)/claims/client'
import { getClaims } from '@/features/claims/api/server-actions'
import { getVehicles } from '@/features/parameters/vehicles/api/server-actions'

const ClaimsPage = async () => {
  const [claims, vehicles] = await Promise.all([getClaims(), getVehicles()])

  if (!claims) {
    return <div>No claims data available</div>
  }

  return (
    <div className="h-full">
      <ClaimsClient claims={claims as any} vehicles={vehicles as any} />
    </div>
  )
}

export default ClaimsPage
