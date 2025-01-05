'use client'

import {
  Breadcrumb as Bc,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Fragment } from 'react'

const Breadcrumb = () => {
  const path = usePathname()
  const searchParams = useSearchParams()
  const pathNames = path.split('/').filter((path) => path)

  return (
    <Bc className="hidden md:flex">
      <BreadcrumbList>
        {path !== '/dashboard' && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathNames.length > 0 && <BreadcrumbSeparator />}
          </>
        )}

        {pathNames.map((link, index) => {
          const href = `/${pathNames.slice(0, index + 1).join('/')}`
          let linkName = link[0].toUpperCase() + link.slice(1, link.length)
          const isLastPath = pathNames.length === index + 1

          // Change "Create" to "Edit" when editing a vehicle
          if (isLastPath && link === 'create' && searchParams.has('id')) {
            linkName = 'Edit'
          }

          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {!isLastPath ? (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{linkName}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{linkName}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {pathNames.length !== index + 1 && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Bc>
  )
}

export default Breadcrumb
