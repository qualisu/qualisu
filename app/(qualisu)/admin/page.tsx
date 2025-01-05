import { getUserGroups } from '@/actions/user-groups'
import AdminClient from '@/app/(qualisu)/admin/client'
import { getUsers } from '@/actions/users'
import { getPoints } from '@/features/parameters/points/api/server-actions'
import { getChecklistTypes } from '@/features/checklists/questions/api/server-actions'

const AdminPage = async () => {
  const users = await getUsers()
  const userGroups = await getUserGroups()
  const points = await getPoints()
  const types = await getChecklistTypes()

  return (
    <div className="h-full">
      <AdminClient
        users={users}
        userGroups={userGroups}
        points={points}
        types={types}
      />
    </div>
  )
}

export default AdminPage
