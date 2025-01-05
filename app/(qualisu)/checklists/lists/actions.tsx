'use client'

import { useRouter } from 'next/navigation'
import { Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { AlertModal } from '@/components/alert-modal'
import { deleteChecklist } from '@/features/checklists/questions/api/server-actions'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onDelete = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      await deleteChecklist(id)
      toast({
        variant: 'success',
        title: '🎉 Checklist silindi',
        description: 'Checklist başarıyla silindi.'
      })
      router.push('/checklists/lists')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '🚨 Hata',
        description: 'Bir şeyler ters gitti.'
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }, [id, router, toast])

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => {
          setOpen(false)
        }}
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
            onClick={() => router.push(`/checklists/lists/create?id=${id}`)}
          >
            <Edit className="size-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
            }}
          >
            <Trash className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
