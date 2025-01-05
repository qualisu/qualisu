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

interface SimulatorClientProps {
  points: any[]
  users: any[]
  groups: any[]
  models: any[]
  vehicles: any[]
}

const SimulatorClient = ({
  points,
  users,
  groups,
  models,
  vehicles
}: SimulatorClientProps) => {
  const [checklist, setChecklist] = React.useState<any[]>([])
  const [checklistType, setChecklistType] = React.useState<string>('prev')
  const [itemNo, setItemNo] = React.useState<string>('')
  const [pointsId, setPointsId] = React.useState<string>('')

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full md:min-w-[450px]"
    >
      <ResizablePanel minSize={20} defaultSize={20} className="px-2 py-1">
        <SelectPanel
          points={points}
          users={users}
          groups={groups}
          models={models}
          vehicles={vehicles}
          setChecklistType={setChecklistType}
          onChecklistChange={setChecklist as (newChecklist: any[]) => void}
          setItemNo={setItemNo}
          setPointsId={setPointsId}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={60}
        defaultSize={60}
        className="px-2 py-1 space-y-2"
      >
        {checklist.length > 0 ? <VehicleInfo /> : null}
        <SimulatorsTab
          checklist={checklist}
          checklistType={checklistType}
          itemNo={itemNo}
          pointsId={pointsId}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default SimulatorClient
