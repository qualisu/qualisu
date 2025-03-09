'use client'

import { useState } from 'react'
import { MessageCircleQuestion, Download, Upload } from 'lucide-react'

import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { columns } from './columns'
import { Claim } from './columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimsAnalytics } from './components/claims-analytics'
import { DataTableToolbar } from './components/data-table-toolbar'
import { VehiclesColumn } from '../parameters/vehicles/columns'

interface ClaimsClientProps {
  claims: Claim[]
  vehicles: VehiclesColumn[]
}

const ClaimsClient = ({ claims, vehicles }: ClaimsClientProps) => {
  const [data, setData] = useState<Claim[]>(claims)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex flex-col gap-8 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Claims"
          description="Manage your claims"
          icon={<MessageCircleQuestion />}
        />
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="analytics">
          <ClaimsAnalytics claims={data} vehicles={vehicles} />
        </TabsContent>
        <TabsContent value="table">
          <div className="grid gap-4 grid-cols-1">
            <DataTable<Claim, string>
              columns={columns}
              data={data}
              filterKey="claimNo"
              isAdd={false}
              disabled={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClaimsClient
