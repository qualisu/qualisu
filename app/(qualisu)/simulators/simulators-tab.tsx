'use client'

import { useRouter } from 'next/navigation'

import {
  createSimulator,
  getSimulatorId
} from '@/features/simulators/api/server-actions'
import { ChecklistsColumn } from '@/app/(qualisu)/checklists/lists/checklists-columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NotFoundChecklists from '@/app/(qualisu)/simulators/not-found'

interface SimulatorsTabProps {
  checklist: ChecklistsColumn[]
  checklistType: string
  itemNo: string
  pointsId: string
}

export default function SimulatorsTab({
  checklist,
  checklistType,
  itemNo,
  pointsId
}: SimulatorsTabProps) {
  const router = useRouter()

  return (
    <>
      {checklist.length > 0 ? (
        <Tabs defaultValue="waiting" className="w-full px-2 py-1">
          <TabsList className="grid w-full grid-cols-4">
            {checklistType === 'vehicle' ? (
              <>
                <TabsTrigger value="waiting">Waiting</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="mandatory">Mandatory</TabsTrigger>
                <TabsTrigger value="independent">Independent</TabsTrigger>
              </>
            )}
            <TabsTrigger value="continue">Continue</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          {/* {checklistType === 'vehicle' ? (
            <>
              <TabsContent value="waiting">
                {checklist.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {checklist.map((item) => (
                      <Card
                        key={item.id}
                        className={`${
                          item.simulators.find((s) => s.itemNo === itemNo)
                            ?.status === 'Completed'
                            ? 'opacity-50 cursor-not-allowed bg-lime-100 border border-lime-500'
                            : 'cursor-pointer hover:bg-accent'
                        }`}
                        onClick={async () => {
                          if (
                            item.simulators.find((s) => s.itemNo === itemNo)
                              ?.status === 'Completed'
                          ) {
                            return
                          }

                          await createSimulator({
                            itemNo,
                            pointsId,
                            checklistsId: item.id
                          })

                          const simulatorId = await getSimulatorId({
                            itemNo,
                            pointsId,
                            checklistsId: item.id
                          })

                          router.push(
                            `/simulators/${item.id}?simulator=${simulatorId}`
                          )
                        }}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="font-semibold">
                            {item.checklistTypes.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="truncate text-xl font-bold">
                            {itemNo}
                          </div>
                          <p className="text-xs space-x-1">
                            <span className="font-semibold">Created Date:</span>
                            <span>{item.createdAt}</span>
                          </p>
                          <p className="text-xs space-x-1">
                            <span className="font-semibold">Status:</span>
                            <span className="text-xs">
                              {item.simulators.filter(
                                (simulator) => simulator.itemNo === itemNo
                              )?.[0]?.status || 'Not Started'}
                            </span>
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <NotFoundChecklists />
                )}
              </TabsContent>
              <TabsContent value="manual">
                {checklist.length > 0 ? (
                  <div>Manual</div>
                ) : (
                  <NotFoundChecklists />
                )}
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="mandatory">
                {checklist.length > 0 ? (
                  <div>Mandatory</div>
                ) : (
                  <NotFoundChecklists />
                )}
              </TabsContent>
              <TabsContent value="independent">
                {checklist.length > 0 ? (
                  <div>Independent</div>
                ) : (
                  <NotFoundChecklists />
                )}
              </TabsContent>
            </>
          )}
          <TabsContent value="continue">
            {checklist.length > 0 ? (
              <div>Continue</div>
            ) : (
              <NotFoundChecklists />
            )}
          </TabsContent>
          <TabsContent value="completed">
            {checklist.length > 0 ? (
              <div>Completed</div>
            ) : (
              <NotFoundChecklists />
            )}
          </TabsContent> */}
        </Tabs>
      ) : (
        <NotFoundChecklists />
      )}
    </>
  )
}
