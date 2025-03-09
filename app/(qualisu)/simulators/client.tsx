'use client'

import React from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import SelectPanel from './panel'
import SimulatorsTab from './tabs'
import VehicleInfo from './vehicle-info'
import { User } from '@/actions/users'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import ManualErrorEntryModal from './manual-error-entry-modal'

interface SimulatorClientProps {
  users: User[]
}

const SimulatorClient = ({ users }: SimulatorClientProps) => {
  const [checklist, setChecklist] = React.useState<any[]>([])
  const [vehicleInfo, setVehicleInfo] = React.useState<{
    model: string
    chassisNo: string
    fertNo: string
    zobasNo: string
    country: string
  } | null>(null)
  const [isManualErrorModalOpen, setIsManualErrorModalOpen] =
    React.useState(false)

  const handleChecklistChange = (newChecklist: any[], vehicleData?: any) => {
    setChecklist(newChecklist)
    if (vehicleData) {
      setVehicleInfo({
        model: vehicleData.model || '',
        chassisNo: vehicleData.chassisNo || '',
        fertNo: vehicleData.fertNo || '',
        zobasNo: vehicleData.zobasNo || '',
        country: vehicleData.country || ''
      })
    }
  }

  return (
    <>
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="p-4">
            <SelectPanel
              users={users}
              onChecklistChange={handleChecklistChange}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <div className="p-4 h-full space-y-4">
            {checklist.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  {vehicleInfo && <VehicleInfo vehicleInfo={vehicleInfo} />}
                  <Button
                    variant="default"
                    className="gap-2"
                    onClick={() => setIsManualErrorModalOpen(true)}
                  >
                    <PlusCircle size={18} />
                    Manual Hata Girişi
                  </Button>
                </div>
              </>
            ) : null}
            <SimulatorsTab checklist={checklist} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ManualErrorEntryModal
        isOpen={isManualErrorModalOpen}
        onClose={() => setIsManualErrorModalOpen(false)}
        vehicleInfo={vehicleInfo}
      />
    </>
  )
}

export default SimulatorClient
