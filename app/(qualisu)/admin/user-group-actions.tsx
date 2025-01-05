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
import {
  type UserGroups,
  type Points,
  type ChecklistTypes
} from '@prisma/client'
import { UserGroupDialog } from '@/components/user-groups/user-group-dialog'
import { useToast } from '@/components/ui/use-toast'
import { deleteUserGroup } from '@/actions/user-groups'

interface UserGroupActionsProps {
  userGroup: UserGroups & { points: Points[]; types: ChecklistTypes[] }
  points: Points[]
  types: ChecklistTypes[]
}

export const UserGroupActions = ({
  userGroup,
  points,
  types
}: UserGroupActionsProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await deleteUserGroup(userGroup.id)
      toast({
        title: 'User group deleted successfully',
        variant: 'default'
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Failed to delete user group',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <UserGroupDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          router.refresh()
          setIsEditModalOpen(false)
        }}
        userGroup={userGroup}
        points={points}
        types={types}
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
