'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'

import { deleteVehicleGroup } from '@/features/parameters/groups/api/server-actions'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteVehicleGroup(id)
      toast({
        variant: 'success',
        title: '🎉 Vehicle group deleted',
        description: 'Vehicle group deleted successfully'
      })
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Error',
        description: 'Something went wrong'
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/parameters/groups/create?id=${id}`)}
          >
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
