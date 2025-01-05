'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'
import { MessageCircleQuestion, PlusIcon } from 'lucide-react'
import { User, UserGroups, Points, ChecklistTypes } from '@prisma/client'

import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { UserGroupDialog } from '@/components/user-groups/user-group-dialog'
import { UserColumn, columns as userColumns } from './admin-columns'
import {
  UserGroupColumn,
  columns as userGroupColumns
} from './user-groups-columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserDialog } from '@/components/users/user-dialog'

interface AdminProps {
  id?: string
  users: {
    id: string
    name: string | null
    email: string | null
    emailVerified: Date | null
    role: User['role']
    dept: User['dept']
    userGroups: UserGroups[]
  }[]
  userGroups: (UserGroups & { points: Points[]; types: ChecklistTypes[] })[]
  points: Points[]
  types: ChecklistTypes[]
}

const AdminClient = ({ users, userGroups, points, types }: AdminProps) => {
  const router = useRouter()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)

  const formattedUsers = users.map((user) => ({
    ...user,
    emailVerified: user.emailVerified
      ? new Date(user.emailVerified).toLocaleDateString()
      : null
  }))

  const formattedUserGroups = userGroups.map((group) => ({
    ...group,
    usersCount: 0,
    pointsCount: group.points.length,
    typesCount: group.types.length,
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt)
  }))

  return (
    <div className="flex flex-col gap-8 px-2">
      <Heading
        title="Users"
        description="Manage your users"
        icon={<MessageCircleQuestion />}
      />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="user-groups">User Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-10">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
          <DataTable<UserColumn, string>
            columns={userColumns}
            data={formattedUsers as UserColumn[]}
            filterKey={'name'}
            isAdd={false}
            meta={{ userGroups }}
          />
          <UserDialog
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              router.refresh()
            }}
          />
        </TabsContent>
        <TabsContent value="user-groups" className="mt-10">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsCreateGroupModalOpen(true)}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
          <DataTable<UserGroupColumn, string>
            columns={userGroupColumns({ points, types })}
            data={formattedUserGroups as UserGroupColumn[]}
            filterKey={'name'}
            isAdd={false}
          />
          <UserGroupDialog
            isOpen={isCreateGroupModalOpen}
            onClose={() => setIsCreateGroupModalOpen(false)}
            onSuccess={() => {
              router.refresh()
            }}
            points={points}
            types={types}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminClient
