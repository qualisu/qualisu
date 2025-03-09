import { GroupsColumn } from '@/app/(qualisu)/parameters/groups/columns'
import GroupClient from '@/app/(qualisu)/parameters/groups/client'
import { getGroups } from '@/features/parameters/groups/api/server-actions'

const VehicleGroupsPage = async () => {
  const data = await getGroups()

  return <GroupClient data={data as GroupsColumn[]} />
}

export default VehicleGroupsPage
