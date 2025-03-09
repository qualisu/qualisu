import { getGroups } from '@/features/parameters/groups/api/server-actions'
import { getModelById } from '@/features/parameters/models/api/server-actions'
import { ModelForm } from '@/features/parameters/models/components/model-form'
import { GroupsColumn } from '../../groups/columns'
import { ModelsColumn } from '../columns'

interface Props {
  searchParams: { id?: string }
}

export default async function CreatePage({ searchParams }: Props) {
  const model = await getModelById(searchParams.id ?? '')
  const groups = await getGroups()

  return (
    <div className="px-2">
      <ModelForm
        initialData={model as unknown as ModelsColumn}
        groups={groups as GroupsColumn[]}
      />
    </div>
  )
}
