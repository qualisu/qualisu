'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { useState, useEffect } from 'react'

interface FailureFrequencyChartProps {
  data: Array<{
    model: string
    frequency: number
    failureCount: number
    vehicleCount: number
  }>
  selectedFailureCode: string | null
  selectedDate: string | null
  onModelSelect: (model: string | null) => void
}

export const FailureFrequencyChart = ({
  data,
  selectedFailureCode,
  onModelSelect
}: FailureFrequencyChartProps) => {
  const [selectedModelState, setSelectedModelState] = useState<string | null>(
    null
  )
  const [filteredData, setFilteredData] = useState(data)

  useEffect(() => {
    if (selectedFailureCode) {
      setFilteredData(data)
    } else {
      setFilteredData([])
    }
  }, [selectedFailureCode, data])

  const chartConfig = {
    frequency: {
      label: 'Frequency',
      color: 'hsl(var(--chart-3))'
    }
  } satisfies ChartConfig

  if (!selectedFailureCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failure Frequency by Model</CardTitle>
          <CardDescription>
            Select a failure code to see its frequency by model
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!filteredData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failure Frequency by Model</CardTitle>
          <CardDescription>
            No data available for failure code {selectedFailureCode}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Sort data by frequency in descending order
  const sortedData = [...filteredData].sort((a, b) => b.frequency - a.frequency)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Failure Frequency by Model</CardTitle>
        <CardDescription>
          Failure frequency for {selectedFailureCode} by model (Claims/Vehicles)
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <ChartContainer config={chartConfig}>
          <BarChart
            data={sortedData}
            layout="vertical"
            height={Math.min(600, Math.max(300, sortedData.length * 40))}
            width={800}
            margin={{ left: 0, right: 50, top: 0, bottom: 0 }}
            accessibilityLayer
            onClick={(data) => {
              const model = data?.activePayload?.[0]?.payload?.model
              if (model) {
                const newModel = model === selectedModelState ? null : model
                setSelectedModelState(newModel)
                onModelSelect(newModel)
              }
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="model"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              orientation="left"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                `${(value * 100).toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}%`
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [
                `${(value * 100).toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}%`,
                'Frequency'
              ]}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Model:</div>
                        <div>{data.model}</div>
                        <div className="font-medium">Frequency:</div>
                        <div>
                          {(data.frequency * 100).toLocaleString('tr-TR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                          %
                        </div>
                        <div className="font-medium">Claims:</div>
                        <div>{data.failureCount}</div>
                        <div className="font-medium">Vehicles:</div>
                        <div>{data.vehicleCount}</div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="frequency"
              fill="hsl(var(--chart-3))"
              radius={8}
              className="cursor-pointer"
            >
              <LabelList
                dataKey="frequency"
                position="right"
                formatter={(value: number) =>
                  `${(value * 100).toLocaleString('tr-TR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}%`
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
