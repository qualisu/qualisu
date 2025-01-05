'use client'

import * as React from 'react'
import {
  AudioWaveform,
  CheckCheck,
  GalleryVerticalEnd,
  LayoutDashboardIcon,
  Play,
  Settings,
  Settings2,
  Settings2Icon
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'

const data = {
  teams: [
    {
      name: 'FQM',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Agile Team #1',
      logo: AudioWaveform,
      plan: 'Startup'
    }
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
      isActive: true
    },
    {
      title: 'Checklists',
      url: '/checklists',
      icon: CheckCheck,
      items: [
        {
          title: 'Lists',
          url: '/checklists/lists'
        },
        {
          title: 'Questions',
          url: '/checklists/questions'
        }
      ]
    },
    {
      title: 'Parameters',
      url: '/parameters',
      icon: Settings2Icon,
      items: [
        {
          title: 'Groups',
          url: '/parameters/groups'
        },
        {
          title: 'Models',
          url: '/parameters/models'
        },
        {
          title: 'Vehicles',
          url: '/parameters/vehicles'
        },
        {
          title: 'Points',
          url: '/parameters/points'
        },
        {
          title: 'Failures',
          url: '/parameters/failures'
        },
        {
          title: 'Categories',
          url: '/parameters/categories'
        },
        {
          title: 'Dealers',
          url: '/parameters/dealers'
        }
      ]
    },
    {
      title: 'Simulators',
      url: '/simulators',
      icon: Play
    },
    {
      title: 'Admin',
      url: '/admin',
      icon: Settings
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
