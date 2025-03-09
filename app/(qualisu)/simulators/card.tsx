import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FormStatus } from '@prisma/client'

interface ChecklistCardProps {
  id: string
  title: string
  description: string
  status?: FormStatus
  onClick?: () => void
  className?: string
  createdAt?: Date
}

export const ChecklistCard = ({
  id,
  title,
  description,
  onClick,
  className,
  status,
  createdAt
}: ChecklistCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'hover:bg-accent cursor-pointer transition-colors relative',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              status === FormStatus.Active
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {status === FormStatus.Active ? 'Active' : 'Disabled'}
          </span>
          <span className="flex items-center justify-center space-x-1 text-xs text-orange-500">
            <Flame className="h-3 w-3" />
            <span>{createdAt?.toLocaleString()}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
