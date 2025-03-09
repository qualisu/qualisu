'use client'

import { useRouter } from 'next/navigation'

import { Edit, MoreHorizontal, Trash } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { deleteChecklist } from '@/features/checklists/api/server-actions'
import { toast } from 'sonner'
import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = () => {
    router.push(`/checklists/?id=${id}`)
  }

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteChecklist(id)
      toast({
        variant: 'success',
        title: '🎉 Category deleted',
        description: 'Category deleted successfully'
      })
      router.refresh()
      router.push('/checklists/lists')
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
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
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
