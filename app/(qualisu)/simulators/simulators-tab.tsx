'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import NotFoundChecklists from '@/app/(qualisu)/simulators/not-found'
import { ChecklistsColumn } from '../checklists/lists/checklists-columns'
import { ChecklistCard } from './simulator-card'

interface SimulatorsTabProps {
  checklist: ChecklistsColumn[]
}

const CHECKLIST_TYPES = {
  MANDATORY: ['Supplier'],
  CHECKLISTS: ['Standard', 'Complaint', 'Regulations'],
  INDEPENDENT: [],
  COMPLETED: []
}

export default function SimulatorsTab({ checklist }: SimulatorsTabProps) {
  const filterChecklistsByType = (types: string[]) =>
    checklist.filter((item) => types.includes(item.checklistTypes.name))

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
    <Tabs defaultValue="mandatory" className="w-full px-2 py-1">
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
              title={item.checklistTypes.name}
              point={item.points[0]?.name || ''}
              model={item.models[0]?.name || ''}
              itemNo={getStoredItemNo()}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="checklists">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.CHECKLISTS).map((item) => (
            <ChecklistCard
              key={item.id}
              title={item.checklistTypes.name}
              point={item.points[0]?.name || ''}
              model={item.models[0]?.name || ''}
              itemNo={getStoredItemNo()}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="independent">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.INDEPENDENT).map((item) => (
            <ChecklistCard
              key={item.id}
              title={item.checklistTypes.name}
              point={item.points[0]?.name || ''}
              model={item.models[0]?.name || ''}
              itemNo={getStoredItemNo()}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="completed">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filterChecklistsByType(CHECKLIST_TYPES.COMPLETED).map((item) => (
            <ChecklistCard
              key={item.id}
              title={item.checklistTypes.name}
              point={item.points[0]?.name || ''}
              model={item.models[0]?.name || ''}
              itemNo={getStoredItemNo()}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
