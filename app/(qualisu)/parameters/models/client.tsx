'use client'

import { useState } from 'react'
import {
  columns,
  ModelsColumn
} from '@/app/(qualisu)/parameters/models/columns'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { BusFront, PlusIcon, Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  deleteModel,
  importModels
} from '@/features/parameters/models/api/server-actions'
import { toast } from 'sonner'
import { FormStatus } from '@prisma/client'

interface ModelClientProps {
  data: ModelsColumn[]
  id?: string
}

const ModelClient = ({ data: initialData, id }: ModelClientProps) => {
  const router = useRouter()
  const [data, setData] = useState<ModelsColumn[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!id) return
    await deleteModel(id)
    router.refresh()
  }

  const handleDownloadTemplate = () => {
    const headers = ['name,group,status']
    const example = ['Example Model,Example Group,ACTIVE']
    const note = [
      '# Status must be ACTIVE or PASSIVE',
      '# You can use either comma (,) or semicolon (;) as separator',
      '# Example with semicolon:',
      'Example Model;Example Group;ACTIVE'
    ]
    const csvContent = [...headers, ...example, ...note].join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8'
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'models-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadData = () => {
    // Use semicolon as default separator for Excel compatibility
    const headers = ['name;group;status']
    const rows = data.map((model) =>
      [model.name, model.group, model.status].join(';')
    )

    const csvContent = [headers, ...rows].join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8'
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `models-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').filter((row) => row.trim() !== '')

        // Detect the separator (comma or semicolon)
        const firstRow = rows[0]
        const separator = firstRow.includes(';') ? ';' : ','

        const headers = rows[0].split(separator)

        try {
          const modelData = rows.slice(1).map((row) => {
            const values = row.split(separator).map((val) => val.trim())

            if (values.length < 3) {
              throw new Error(
                `Invalid row format: ${row}. Expected name, group, and status`
              )
            }

            const [name, group, status] = values

            if (!name || !group || !status) {
              throw new Error(`Missing required fields in row: ${row}`)
            }

            // Validate status value
            const upperStatus = status.toUpperCase()
            if (!['ACTIVE', 'PASSIVE'].includes(upperStatus)) {
              throw new Error(
                `Invalid status value in row: ${row}. Status must be ACTIVE or PASSIVE`
              )
            }

            return {
              name,
              group,
              status: upperStatus as FormStatus
            }
          })

          const result = await importModels(modelData)

          if (result.success && result.results) {
            const successCount = result.results.filter((r) => r.success).length
            const failureCount = result.results.filter((r) => !r.success).length

            if (successCount > 0) {
              toast.success(`Successfully imported ${successCount} models`)
              router.refresh()
            }

            if (failureCount > 0) {
              const failures = result.results
                .filter((r) => !r.success)
                .map((r) => `${r.model}: ${r.error}`)
                .join('\n')
              toast.error(
                `Failed to import ${failureCount} models:\n${failures}`
              )
            }
          } else {
            toast.error(result.error || 'Failed to import models')
          }
        } catch (error) {
          console.error('Error importing models:', error)
          toast.error('Failed to import models')
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicle Models"
          description="Manage your vehicle models"
          icon={<BusFront />}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={handleDownloadData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => document.getElementById('csvInput')?.click()}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/parameters/models/create')}
          >
            <PlusIcon className="size-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>
      <DataTable<ModelsColumn, string>
        columns={columns}
        data={data}
        filterKey="name"
        isAdd={false}
        disabled={isLoading}
      />
      <input
        id="csvInput"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  )
}

export default ModelClient
