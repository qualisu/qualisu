'use client'

import React from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import SelectPanel from './select-panel'
import SimulatorsTab from './simulators-tab'
import VehicleInfo from './vehicle-info'
import { Points, User, UserGroups } from '@prisma/client'

interface SimulatorClientProps {
  user: User & { userGroups: (UserGroups & { points: Points[] })[] }
}

const SimulatorClient = ({ user }: SimulatorClientProps) => {
  const [checklist, setChecklist] = React.useState<any[]>([])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full md:min-w-[450px]"
    >
      <ResizablePanel minSize={20} defaultSize={20} className="px-2 py-1">
        <SelectPanel
          user={user}
          onChecklistChange={setChecklist as (newChecklist: any[]) => void}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={60}
        defaultSize={60}
        className="px-2 py-1 space-y-2"
      >
        {checklist.length > 0 ? <VehicleInfo /> : null}
        <SimulatorsTab checklist={checklist} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default SimulatorClient
