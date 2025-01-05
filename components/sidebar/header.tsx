'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PanelLeft } from 'lucide-react'

import { Search } from '@/components/search'
import { NavItems } from '@/components/sidebar/nav'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import Breadcrumb from './breadcrumb'
import { ModeToggle } from '../theme-select'

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[540px]">
          <nav className="grid gap-6">
            <Link
              href="/"
              className="flex shrink-0 bg-[#da251c] w-10 h-10 p-1.5 rounded-md md:h-8 md:w-8"
            >
              <Image src="/logo.svg" alt="Logo" height={48} width={48} />
            </Link>
            {NavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-2.5 text-muted-foreground hover:text-foreground"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb />
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search />
      </div>
      <ModeToggle />
    </header>
  )
}
