'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { VehiclesColumn } from '../columns'
import { format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState } from 'react'

interface VehiclesAnalyticsProps {
  data: VehiclesColumn[]
}

export default function VehiclesAnalytics({ data }: VehiclesAnalyticsProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const barChartConfig = {
    count: {
      label: 'Count',
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig

  // Filter data based on selected year and month
  const filteredData = data.filter((vehicle) => {
    const vehicleYear = format(new Date(vehicle.prodDate), 'yyyy')
    const vehicleMonth = format(new Date(vehicle.prodDate), 'MM/yyyy')

    if (selectedMonth) {
      return vehicleMonth === selectedMonth
    }
    if (selectedYear) {
      return vehicleYear === selectedYear
    }
    return true
  })

  // Group vehicles by production date
  const productionDateStats = filteredData.reduce((acc: any, vehicle) => {
    const date = selectedYear
      ? format(new Date(vehicle.prodDate), 'MM/yyyy')
      : format(new Date(vehicle.prodDate), 'yyyy')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  const productionDateData = Object.entries(productionDateStats)
    .map(([date, count]) => ({
      time: date,
      count,
      opacity: selectedYear
        ? !selectedMonth && date.endsWith(selectedYear)
          ? 1
          : 0.3
        : 1
    }))
    .sort((a, b) => {
      if (selectedYear) {
        const [aMonth] = a.time.split('/')
        const [bMonth] = b.time.split('/')
        return parseInt(aMonth) - parseInt(bMonth)
      }
      return a.time.localeCompare(b.time)
    })

  // Group vehicles by model
  const modelStats = filteredData.reduce((acc: any, vehicle) => {
    acc[vehicle.vehicleModel] = (acc[vehicle.vehicleModel] || 0) + 1
    return acc
  }, {})

  const modelData = Object.entries(modelStats)
    .map(([model, count]) => ({
      time: model,
      count
    }))
    .sort((a, b) => a.time.localeCompare(b.time))

  const handleBarClick = (data: any) => {
    const clickedLabel = data?.activeLabel

    if (!selectedYear) {
      // If no year selected, select the clicked year
      setSelectedYear(clickedLabel)
    } else if (!selectedMonth && clickedLabel.includes('/')) {
      // If year is selected but no month, select the clicked month
      setSelectedMonth(clickedLabel)
    }
  }

  const handleClear = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vehicles by Production Date</CardTitle>
            <CardDescription>
              {selectedMonth
                ? `Number of vehicles in ${selectedMonth}`
                : selectedYear
                ? `Number of vehicles by month in ${selectedYear}`
                : 'Number of vehicles by year'}
            </CardDescription>
          </div>
          {(selectedYear || selectedMonth) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig}>
            <BarChart data={productionDateData} onClick={handleBarClick}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => value.toLocaleString('tr-TR')}
              />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString('tr-TR'),
                  'Count'
                ]}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={8}
                className="cursor-pointer"
                fillOpacity="opacity"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicles by Model</CardTitle>
          <CardDescription>
            Number of vehicles by model type
            {selectedMonth
              ? ` in ${selectedMonth}`
              : selectedYear
              ? ` in ${selectedYear}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barChartConfig}>
            <BarChart data={modelData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tickFormatter={(value) => value.toLocaleString('tr-TR')}
              />
              <Tooltip
                formatter={(value: number) => [
                  value.toLocaleString('tr-TR'),
                  'Count'
                ]}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
