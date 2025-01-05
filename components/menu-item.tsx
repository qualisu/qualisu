'use client'

import { ChevronDown, LucideIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import SubMenuItem from './submenu-item'

interface ISidebarItem {
  name: string
  icon: LucideIcon
  path: string
  items?: ISubItem[]
}

interface ISubItem {
  name: string
  path: string
}

const SidebarItem = ({ item }: { item: ISidebarItem }) => {
  const { name, icon: Icon, items, path } = item
  const [expanded, setExpanded] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const onClick = () => {
    if (items && item.items!.length > 0) {
      return setExpanded(!expanded)
    }

    router.push(path)
  }

  const isActive = useMemo(() => {
    if (items && items.length > 0) {
      if (items.find((item) => item.path === pathname)) {
        setExpanded(true)
        return true
      }
    }

    return path === pathname
  }, [path, pathname, items])

  return (
    <>
      <div
        className={`flex items-center p-2 rounded-lg hover:bg-indigo-50 
      cursor-pointer hover:text-indigo-500 justify-between text-muted-foreground
      ${isActive && 'text-indigo-500 bg-indigo-50'}
      `}
        onClick={onClick}
      >
        <div className="flex items-center space-x-2">
          <Icon size={18} />
          <p className="text-sm font-semibold">{name}</p>
        </div>
        {items && items.length > 0 && (
          <ChevronDown
            size={18}
            className={expanded ? 'rotate-180 duration-200' : ''}
          />
        )}
      </div>

      {expanded && item && items!.length > 0 && (
        <div className="flex flex-col space-y-2 ml-10 mt-2">
          {items!.map((item) => (
            <SubMenuItem key={item.path} item={item} />
          ))}
        </div>
      )}
    </>
  )
}

export default SidebarItem
