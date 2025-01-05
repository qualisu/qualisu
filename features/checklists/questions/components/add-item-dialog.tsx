import { Button } from '@/components/ui/button'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface Props {
  id?: string
  isOpen: boolean
  onClose: () => void
  onItemAdd: (item: string) => void
  disabled?: boolean
}

const AddItemDialog = ({ id, isOpen, onClose, onItemAdd, disabled }: Props) => {
  const [item, setItem] = useState<string>('')

  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  const handleAddItemNo = () => {
    onItemAdd(item)
    setItem('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogTitle>Item No(s)</DialogTitle>
        <Input
          className="w-3/4"
          placeholder="Item No..."
          value={item}
          onChange={(e) => setItem(e.target.value)}
          disabled={disabled}
        />
        <DialogClose asChild>
          <Button onClick={handleAddItemNo} disabled={disabled}>
            {id ? 'Seçili Soruları Güncelle' : 'Seçili Soruları Ekle'}
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export default AddItemDialog
