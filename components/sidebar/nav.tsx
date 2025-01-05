'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { CheckCheck, LayoutDashboardIcon, Play, Settings2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export const NavItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboardIcon className="h-5 w-5" />
  },
  {
    label: 'Checklist',
    href: '/checklists/lists',
    icon: <CheckCheck className="h-5 w-5" />
  },
  {
    label: 'Simulators',
    href: '/simulators',
    icon: <Play className="h-5 w-5" />
  },
  {
    label: 'Parameters',
    href: '/parameters/groups',
    icon: <Settings2 className="h-5 w-5" />
  }
]

export function Nav() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="/"
          className="flex shrink-0 bg-[#da251c] p-1.5 rounded-md md:h-8 md:w-8"
        >
          <Image src="/logo.svg" alt="Logo" height={48} width={48} />
        </Link>
        <TooltipProvider>
          {NavItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    item.href === pathname
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.icon}
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
