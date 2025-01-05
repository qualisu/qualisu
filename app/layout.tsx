import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'

import './globals.css'

import { Inter, Quicksand } from 'next/font/google'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Toaster } from '@/components/ui/toaster'
import { ThemeToggle } from '@/components/theme-toggle'

import ModalProvider from '@/providers/modal-provider'
import QueryProvider from '@/providers/query-provider'
import ThemeProvider from '@/providers/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Qualisu',
  description: 'Everything about quality.'
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={cn('light:bg-gray-50', inter.className)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <ModalProvider />
            <Toaster />
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  )
}
