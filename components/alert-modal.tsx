'use client'

import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}: AlertModalProps) => {
  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button
          variant="outline"
          onClick={() => {
            onClose()
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm()
          }}
          disabled={loading}
          variant="destructive"
        >
          Confirm
        </Button>
      </div>
    </Modal>
  )
}
