import { notFound } from 'next/navigation'
import {
  getSimulatorById,
  getVehicleByItemNo
} from '@/features/simulators/api/server-actions'
import { getQuestionsByChecklistId } from '@/features/checklists/api/server-actions'
import SimulatorQuestions from './questions'

interface SimulatorPageProps {
  params: { id: string }
}

export default async function SimulatorPage({ params }: SimulatorPageProps) {
  const simulator = await getSimulatorById(params.id)

  if (!simulator) {
    notFound()
  }

  const questions = await getQuestionsByChecklistId(simulator.checklistsId)
  const vehicleInfo = await getVehicleByItemNo(simulator.itemNo)

  const simulatorWithVehicle = {
    ...simulator,
    ...vehicleInfo
  }

  return (
    <div className="container mx-auto py-6">
      <SimulatorQuestions
        simulator={simulatorWithVehicle}
        questions={questions}
      />
    </div>
  )
}
