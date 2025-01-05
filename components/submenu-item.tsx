'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'

interface ISubItem {
  name: string
  path: string
}

const SubMenuItem = ({ item }: { item: ISubItem }) => {
  const { name, path } = item

  const router = useRouter()
  const pathname = usePathname()

  const onClick = () => {
    router.push(path)
  }

  const isActive = useMemo(() => {
    return path === pathname
  }, [path, pathname])

  return (
    <div
      className={`text-sm hover:text-indigo-400 hover:font-semibold cursor-pointer
      ${isActive && 'text-indigo-400 font-semibold'}`}
      onClick={onClick}
    >
      {name}
    </div>
  )
}

export default SubMenuItem
