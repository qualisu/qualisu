'use client'

import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { deleteVehicle } from '@/features/parameters/vehicles/api/server-actions'
import { useToast } from '@/components/ui/use-toast'

interface ActionsProps {
  id: string
}

export function Actions({ id }: ActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const onDelete = async () => {
    try {
      setLoading(true)
      await deleteVehicle(id)
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully'
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => router.push(`/parameters/vehicles/${id}`)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} disabled={loading}>
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
