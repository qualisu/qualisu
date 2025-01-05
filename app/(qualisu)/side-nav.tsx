'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SideNavProps {
  items: {
    Icon?: LucideIcon
    href: string
    label: string
  }[]
}

const SideNav = ({ items }: SideNavProps) => {
  const pathname = usePathname()

  return (
    <nav className="grid gap-4 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            'flex items-center gap-2',
            pathname.startsWith(item.href)
              ? 'text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {item.Icon && <item.Icon size={20} />}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default SideNav
