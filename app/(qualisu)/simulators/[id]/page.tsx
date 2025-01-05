import { db } from '@/lib/db'
import { getChecklistById } from '@/features/checklists/questions/api/server-actions'
import Client from '@/app/(qualisu)/simulators/[id]/client'
import NotFoundChecklists from '@/app/(qualisu)/simulators/not-found'

export default async function SimulatorPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { simulator?: string }
}) {
  const checklist = await getChecklistById(params.id)
  const simulator = searchParams.simulator
  const isValidSimulator = await db.simulators.findFirst({
    where: { id: simulator }
  })

  const answers = await db.answers.findMany({
    where: {
      simulatorsId: simulator
    }
  })

  if (!checklist.id || !simulator || !isValidSimulator) {
    return <NotFoundChecklists />
  }

  return (
    <Client
      questions={checklist.questions as any}
      simulator={simulator}
      answers={answers}
    />
  )
}
