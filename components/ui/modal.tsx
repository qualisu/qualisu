'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface ModalProps {
  title: string
  description: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
