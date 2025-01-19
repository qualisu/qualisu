'use client'

import { useState } from 'react'
import { MessageCircleQuestion, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Claims } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { columns } from './columns'
import { createClaim } from '@/features/claims/api/server-actions'
import { Claim } from './columns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimsAnalytics } from './components/claims-analytics'

interface ClaimsClientProps {
  claims: Claim[]
}

const ClaimsClient = ({ claims }: ClaimsClientProps) => {
  const [data, setData] = useState<Claim[]>(claims)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadTemplate = () => {
    const headers = [
      'claimNumber,claimDate,dealerNo,dealerName,failureCode,claimType,vinNo,km,amount,status,budget'
    ]
    const csvContent = headers.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'claims-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n')
        const headers = rows[0].split(',')
        const newData: Claims[] = []

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(',')
          if (row.length === headers.length) {
            const claimData = {
              claimNumber: row[0],
              claimDate: new Date(row[1]),
              dealerNo: row[2],
              dealerName: row[3],
              failureCode: row[4],
              claimType: row[5],
              vinNo: row[6],
              km: parseInt(row[7]),
              amount: parseFloat(row[8]),
              status: row[9],
              budget: parseFloat(row[10])
            }

            try {
              const result = await createClaim(claimData)
              if (result.success && result.data) {
                newData.push(result.data)
              } else {
                toast.error(`Failed to save claim ${claimData.claimNumber}`)
              }
            } catch (error) {
              console.error('Error saving claim:', error)
              toast.error(`Error saving claim ${claimData.claimNumber}`)
            }
          }
        }
        setData((prevData) => [...prevData, ...newData])
        toast.success('Claims imported successfully')
      }
      reader.readAsText(file)
    }
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-8 px-2">
      <div className="flex items-center justify-between">
        <Heading
          title="Claims"
          description="Manage your claims"
          icon={<MessageCircleQuestion />}
        />
        <div className="flex gap-2">
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('csvInput')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <input
            id="csvInput"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <DataTable<Claim, string>
            columns={columns}
            data={data}
            filterKey="claimNumber"
            isAdd={false}
            disabled={isLoading}
          />
        </TabsContent>
        <TabsContent value="analytics">
          <ClaimsAnalytics claims={claims} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClaimsClient
