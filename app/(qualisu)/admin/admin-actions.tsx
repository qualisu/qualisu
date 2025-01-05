'use client'

import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/alert-modal'
import { type User, type UserGroups } from '@prisma/client'
import { type UserColumn } from './admin-columns'
import { UserDialog } from '@/components/users/user-dialog'

interface AdminActionsProps {
  user: UserColumn & { userGroups?: UserGroups[] }
  userGroups: UserGroups[]
}

export const AdminActions = ({ user, userGroups }: AdminActionsProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const userData: User & { userGroups: UserGroups[] } = {
    ...user,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
    image: null,
    password: null,
    isTwoFactorEnabled: false,
    userGroups: user.userGroups || []
  }

  const onDelete = async () => {
    // TODO: Implement delete functionality
    setOpen(false)
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <UserDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          router.refresh()
          setIsEditModalOpen(false)
        }}
        user={userData}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
