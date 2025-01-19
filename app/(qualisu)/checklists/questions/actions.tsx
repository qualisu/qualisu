'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { deleteCategory } from '@/features/parameters/categories/api/server-actions'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onDelete = async () => {
    if (!id) return
    try {
      setLoading(true)
      // await deleteQuestion(id)
      toast({
        variant: 'success',
        title: '🎉 Question deleted',
        description: 'Question deleted successfully'
      })
      router.push('/checklists/questions')
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
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/checklists/questions/create?id=${id}`)}
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
