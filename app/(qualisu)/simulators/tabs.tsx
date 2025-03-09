'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotFoundChecklists from '@/app/(qualisu)/simulators/not-found'
import { ChecklistsColumn } from '../checklists/lists/columns'
import { ChecklistCard } from './card'
import { useRouter } from 'next/navigation'
import { createSimulator } from '@/features/simulators/api/server-actions'
import { useState } from 'react'
import { FormStatus } from '@prisma/client'

interface SimulatorsTabProps {
  checklist: ChecklistsColumn[]
}

const CHECKLIST_TYPES = {
  MANDATORY: ['Supplier'],
  CHECKLISTS: ['STANDART', 'COMPLAINT', 'REGULATIONS'],
  INDEPENDENT: [],
  COMPLETED: []
}

export default function SimulatorsTab({ checklist }: SimulatorsTabProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('simulator_active_tab') || 'mandatory'
    }
    return 'mandatory'
  })

  const filterChecklistsByType = (types: string[]) =>
    checklist.filter((item) => types.includes(item.type))

  const handleClick = async (pid: string, cid: string) => {
    const simulator = await createSimulator({
      itemNo: getStoredItemNo(),
      pointsId: pid,
      checklistsId: cid
    })

    if (simulator) {
      await router.push(`/simulators/${simulator.id}`)
    }
  }

  const getStoredItemNo = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('checklist_item_no') || ''
    }
    return ''
  }

  if (checklist.length === 0) {
    return <NotFoundChecklists />
  }

  return (
    <Tabs
      defaultValue={activeTab}
      className="w-full px-2 py-1"
      onValueChange={(value) => {
        setActiveTab(value)
        localStorage.setItem('simulator_active_tab', value)
      }}
    >
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
        <TabsTrigger value="checklists">Checklists</TabsTrigger>
        <TabsTrigger value="independent">Independent</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>

      <TabsContent value="mandatory">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.MANDATORY).map((item) => (
            <ChecklistCard
              key={item.id}
              id={item.id}
              title={item.type}
              description={`This checklist is to understand how you found our company and how you see the process`}
              status={item.status === FormStatus.Active ? 'Active' : 'Passive'}
              onClick={() => {
                handleClick(item.points[0]?.id, item.id)
              }}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="checklists">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.CHECKLISTS).map((item) => (
            <ChecklistCard
              key={item.id}
              id={item.id}
              title={item.name}
              description={item.desc}
              createdAt={item.createdAt}
              status={item.status === FormStatus.Active ? 'Active' : 'Passive'}
              onClick={() => {
                handleClick(item.points[0]?.id, item.id)
              }}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="independent">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.INDEPENDENT).map((item) => (
            <ChecklistCard
              key={item.id}
              id={item.id}
              title={item.type}
              description={`This checklist is to understand how you found our company and how you see the process`}
              status={item.status === FormStatus.Active ? 'Active' : 'Passive'}
              onClick={() => {
                handleClick(item.points[0]?.id, item.id)
              }}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.COMPLETED).map((item) => (
            <ChecklistCard
              key={item.id}
              id={item.id}
              title={item.type}
              description={`This checklist is to understand how you found our company and how you see the process`}
              status={item.status === FormStatus.Active ? 'Active' : 'Passive'}
              onClick={() => {
                handleClick(item.points[0]?.id, item.id)
              }}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
