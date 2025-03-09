'use client'

import { useState } from 'react'
import {
  columns,
  VehiclesColumn
} from '@/app/(qualisu)/parameters/vehicles/columns'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { BusFront, Download, PlusIcon, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  deleteVehicle,
  uploadVehicles
} from '@/features/parameters/vehicles/api/server-actions'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VehiclesAnalytics from './components/vehicles-analytics'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'

interface VehicleClientProps {
  vehicles: VehiclesColumn[]
}

const VehicleClient = ({ vehicles }: VehicleClientProps) => {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      await uploadVehicles(formData)

      toast({
        title: 'Success',
        description: 'Vehicles data uploaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload vehicles data',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleExport = () => {
    try {
      const headers = [
        'saseNo,vehicleGroup,vehicleModel,prodDate,warStart,warEnd'
      ]

      const rows = vehicles.map((vehicle) =>
        [
          vehicle.saseNo,
          vehicle.vehicleGroup,
          vehicle.vehicleModel,
          format(new Date(vehicle.prodDate), 'yyyy-MM-dd'),
          format(new Date(vehicle.warStart), 'yyyy-MM-dd'),
          format(new Date(vehicle.warEnd), 'yyyy-MM-dd')
        ].join(',')
      )

      const csvContent = [headers, ...rows].join('\n')
      const BOM = '\uFEFF'
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vehicles-data-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Success',
        description: 'Vehicles data exported successfully'
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Error',
        description: 'Failed to export vehicles data',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Vehicles"
          description="Manage your vehicles"
          icon={<BusFront />}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => router.push('/parameters/vehicles/create')}
          >
            <PlusIcon className="size-4 mr-2" />
            Add New
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Excel
          </Button>
          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <DataTable<VehiclesColumn, any>
            columns={columns}
            data={vehicles}
            filterKey="saseNo"
            isAdd={false}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <VehiclesAnalytics data={vehicles} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default VehicleClient
