import * as React from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import Breadcrumb from '@/components/sidebar/breadcrumb'

interface Props {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout
