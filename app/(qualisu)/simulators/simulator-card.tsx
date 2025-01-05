import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChecklistCardProps {
  title: string
  point: string
  itemNo: string
  model: string
  onClick?: () => void
  className?: string
}

export const ChecklistCard = ({
  title,
  point,
  itemNo,
  model,
  onClick,
  className
}: ChecklistCardProps) => (
  <Card
    onClick={onClick}
    className={cn(
      'hover:bg-accent cursor-pointer transition-colors',
      className
    )}
  >
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{point}</p>
      <p className="text-sm text-muted-foreground">{itemNo}</p>
      <p className="text-sm text-muted-foreground">{model}</p>
    </CardContent>
  </Card>
)
