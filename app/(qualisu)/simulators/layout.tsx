import * as React from 'react'
import { Separator } from '@/components/ui/separator'

interface SimulatorsLayoutProps {
  children: React.ReactNode
}

export default async function SimulatorsLayout({
  children
}: SimulatorsLayoutProps) {
  return (
    <div className="px-6 py-4">
      <div className="space-y-0.5 bg-white z-10">
        <h2 className="text-2xl font-bold tracking-tight">Simulators</h2>
        <p className="text-muted-foreground">Manage all simulators.</p>
      </div>
      <Separator className="my-6" />
      {children}
    </div>
  )
}
