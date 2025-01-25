'use client'

import { useState } from 'react'
import { MessageCircleQuestion, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Claims } from '@prisma/client'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import Heading from '@/components/heading'
import { columns } from './columns'
import { createClaim } from '@/features/claims/api/server-actions'
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

  const handleDownloadTemplate = () => {
    const headers = [
      'claimNo',
      'claimDate',
      'failureCode',
      'country',
      'dealerName',
      'vehicleGroup',
      'vehicleModel',
      'saseNo',
      'kilometre',
      'budgetNo',
      'amount',
      'improvement'
    ]
    const ws = XLSX.utils.aoa_to_sheet([headers])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Claims Template')
    XLSX.writeFile(wb, 'claims-template.xlsx')
  }

  const handleDownloadData = () => {
    const headers = [
      'claimNo',
      'claimDate',
      'failureCode',
      'country',
      'dealerName',
      'vehicleGroup',
      'vehicleModel',
      'saseNo',
      'kilometre',
      'budgetNo',
      'amount',
      'improvement'
    ]

    const rows = data.map((claim) => {
      // Ensure numeric values are always numbers
      const kilometre =
        typeof claim.kilometre === 'number' ? claim.kilometre : 0
      const amount = typeof claim.amount === 'number' ? claim.amount : 0

      return [
        claim.claimNo,
        claim.claimDate.toISOString().split('T')[0],
        claim.failureCode,
        claim.country,
        claim.dealerName,
        claim.vehicleGroup,
        claim.vehicleModel,
        claim.saseNo,
        kilometre,
        claim.budgetNo,
        amount
      ]
    })

    // Configure worksheet to handle numbers correctly
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows], {
      cellDates: true,
      cellStyles: true
    })

    // Force numeric columns to be numbers
    const numericColumns = ['I', 'K'] // kilometre and amount columns
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')

    for (let col of numericColumns) {
      for (let row = 2; row <= range.e.r + 1; row++) {
        const cell = ws[`${col}${row}`]
        if (cell) {
          cell.t = 'n' // Set cell type to number
          cell.v = cell.v || 0 // Ensure value is a number
        }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Claims Data')
    XLSX.writeFile(
      wb,
      `claims-data-${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const rows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: true,
            dateNF: 'dd.mm.yyyy'
          }) as any[][]

          const headers = rows[0]
          const newData: Claims[] = []

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i]
            if (row.length === headers.length) {
              const rawDate = row[1]
              let formattedDate: Date

              if (typeof rawDate === 'string' && rawDate.includes('.')) {
                const [day, month, year] = rawDate
                  .split('.')
                  .map((num) => num.trim())
                formattedDate = new Date(
                  `${year}-${month.padStart(2, '0')}-${day.padStart(
                    2,
                    '0'
                  )}T00:00:00.000Z`
                )
              } else {
                formattedDate = new Date(rawDate)
              }

              // Parse and validate numeric values
              let kilometre = 0
              let amount = 0

              try {
                if (row[8] !== undefined && row[8] !== '') {
                  const kmStr = row[8].toString().replace(/[,\.]/g, '')
                  kilometre = parseInt(kmStr, 10)
                  if (isNaN(kilometre))
                    throw new Error('Invalid kilometre value')
                }

                if (row[10] !== undefined && row[10] !== '') {
                  const amountStr = row[10].toString().replace(/[,$]/g, '')
                  amount = parseFloat(amountStr)
                  if (isNaN(amount)) throw new Error('Invalid amount value')
                }
              } catch (error) {
                console.error(
                  `Row ${i + 1}: Error parsing numeric values:`,
                  error
                )
                toast.error(`Row ${i + 1}: Invalid numeric values`)
                continue
              }

              const claimData = {
                claimNo: (row[0] || '').toString().trim(),
                claimDate: formattedDate,
                failureCode: (row[2] || '').toString().trim(),
                country: (row[3] || '').toString().trim(),
                dealerName: (row[4] || '').toString().trim(),
                vehicleGroup: (row[5] || '').toString().trim(),
                vehicleModel: (row[6] || '').toString().trim(),
                saseNo: (row[7] || '').toString().trim(),
                kilometre,
                budgetNo: (row[9] || '').toString().trim(),
                amount,
                improvement: (row[11] || 'Oncesi').toString().trim()
              }

              // Validate required fields
              const requiredFields = [
                'claimNo',
                'claimDate',
                'failureCode',
                'country',
                'dealerName',
                'vehicleGroup',
                'vehicleModel',
                'saseNo'
              ]
              const missingFields = requiredFields.filter(
                (field) => !claimData[field as keyof typeof claimData]
              )

              if (missingFields.length > 0) {
                toast.error(
                  `Row ${i + 1}: Missing required fields: ${missingFields.join(
                    ', '
                  )}`
                )
                continue
              }

              // Validate numeric values
              if (kilometre < 0) {
                toast.error(`Row ${i + 1}: Kilometre cannot be negative`)
                continue
              }

              if (amount < 0) {
                toast.error(`Row ${i + 1}: Amount cannot be negative`)
                continue
              }

              try {
                const result = await createClaim(claimData)
                if (result.success && result.data) {
                  newData.push(result.data)
                } else {
                  toast.error(
                    `Failed to save claim ${claimData.claimNo} at row ${i + 1}`
                  )
                }
              } catch (error) {
                console.error(`Row ${i + 1}: Error saving claim:`, error)
                toast.error(
                  `Error saving claim ${claimData.claimNo} at row ${i + 1}`
                )
              }
            } else {
              toast.error(`Row ${i + 1}: Invalid number of columns`)
            }
          }
          setData((prevData) => [...prevData, ...newData])
          toast.success('Claims imported successfully')
        } catch (error) {
          console.error('Error processing file:', error)
          toast.error('Failed to process the Excel file')
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
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
            onClick={() => document.getElementById('xlsxInput')?.click()}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Excel
              </>
            )}
          </Button>
          <input
            id="xlsxInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isLoading}
          />
        </div>
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
              toolbar={DataTableToolbar}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClaimsClient
