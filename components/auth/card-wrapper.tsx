'use client'

import { Header } from '@/components/auth/header'
import { BackButton } from '@/components/auth/back-button'

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  headerHeader?: string
  backButtonLabel: string
  backButtonHref: string
}

export const CardWrapper = ({
  children,
  headerLabel,
  headerHeader,
  backButtonLabel,
  backButtonHref
}: CardWrapperProps) => {
  return (
    <div className="flex items-center justify-center">
      <div className="mx-auto grid gap-4 w-[400px]">
        <Header header={headerHeader} label={headerLabel} />
        {children}
        <BackButton label={backButtonLabel} href={backButtonHref} />
      </div>
    </div>
  )
}
