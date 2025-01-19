'use client'

import * as React from 'react'

interface ClaimsLayoutProps {
  children: React.ReactNode
}

export default function ClaimsLayout({ children }: ClaimsLayoutProps) {
  return (
    <div className="hidden space-y-6 p-4 pb-16 md:block">
      <div className="flex-1">{children}</div>
    </div>
  )
}
