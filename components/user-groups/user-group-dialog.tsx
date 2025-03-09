'use client'

import { type UserGroups, type Points, cTypes } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { createUserGroup, updateUserGroup } from '@/actions/user-groups'
import { useToast } from '../ui/use-toast'
import {
  UserGroupForm,
  type UserGroupFormData
} from '@/components/user-groups/user-group-form'

interface UserGroupDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userGroup?: (UserGroups & { points: Points[]; types: cTypes[] }) | null
  points: Points[]
  types: cTypes[]
}

export const UserGroupDialog = ({
  isOpen,
  onClose,
  onSuccess,
  userGroup,
  points,
  types
}: UserGroupDialogProps) => {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isEdit = !!userGroup

  const onSubmit = async (data: UserGroupFormData) => {
    try {
      setLoading(true)
      if (isEdit && userGroup) {
        await updateUserGroup(userGroup.id, data)
        toast({
          title: 'User group updated successfully',
          variant: 'default'
        })
      } else {
        await createUserGroup(data)
        toast({
          title: 'User group created successfully',
          variant: 'default'
        })
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: isEdit
          ? 'Failed to update user group'
          : 'Failed to create user group',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultValues = userGroup
    ? {
        name: userGroup.name,
        points: userGroup.points.map((point) => point.id),
        types: userGroup.types
      }
    : {
        name: '',
        points: [],
        types: []
      }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit User Group' : 'Create User Group'}
          </DialogTitle>
        </DialogHeader>
        <UserGroupForm
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          points={points}
          types={types}
          isEdit={isEdit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  )
}
