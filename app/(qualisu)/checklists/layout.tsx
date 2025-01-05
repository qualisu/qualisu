'use client'

import * as React from 'react'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="hidden space-y-6 p-4 pb-16 md:block">
      <div className="flex-1">{children}</div>
    </div>
  )
}
