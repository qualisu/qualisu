'use client'

import React from 'react'
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

interface FailureFrequencyCountryChartProps {
  data: Array<{
    country: string
    frequency: number
    failureCount: number
    vehicleCount: number
  }>
  selectedFailureCode: string | null
  selectedModel: string | null
}

export const FailureFrequencyCountryChart = ({
  data,
  selectedFailureCode,
  selectedModel
}: FailureFrequencyCountryChartProps) => {
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
          <CardTitle>Failure Frequency by Country</CardTitle>
          <CardDescription>
            Select a failure code to see its frequency by country
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const title = selectedModel
    ? `Failure Frequency by Country for ${selectedModel}`
    : 'Failure Frequency by Country'

  const description = selectedModel
    ? `Failure frequency for ${selectedFailureCode} in ${selectedModel} by country`
    : `Failure frequency for ${selectedFailureCode} by country`

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            No data available for{' '}
            {selectedModel ? `${selectedModel} with ` : ''} failure code{' '}
            {selectedFailureCode}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description} (Claims/Vehicles)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 50, right: 50, top: 0, bottom: 0 }}
            accessibilityLayer
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="country"
              type="category"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              orientation="left"
              tick={(props) => {
                const { x, y, payload } = props
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={-5} y={0} dy={4} textAnchor="end" fill="#666">
                      {payload.value}
                    </text>
                  </g>
                )
              }}
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
            />
            <Tooltip
              formatter={(value: number) => [
                `${(value * 100).toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}%`,
                'Frequency'
              ]}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Country:</div>
                        <div>{data.country}</div>
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
            <Bar dataKey="frequency" fill="var(--color-frequency)" radius={8}>
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
