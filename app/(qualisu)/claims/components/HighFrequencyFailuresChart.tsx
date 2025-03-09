'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface HighFrequencyFailure {
  failureCode: string
  model: string
  frequency: number
  failureCount: number
  vehicleCount: number
}

interface HighFrequencyFailuresChartProps {
  data: HighFrequencyFailure[]
  selectedModel: string | null
  models: string[]
  onModelSelect: (model: string) => void
}

export const HighFrequencyFailuresChart = ({
  data,
  selectedModel,
  models,
  onModelSelect
}: HighFrequencyFailuresChartProps) => {
  const barChartConfig = {
    frequency: {
      label: 'Frequency (%)',
      color: 'hsl(var(--chart-3))'
    }
  } satisfies ChartConfig

  const chartData = data
    .filter((item) => item.failureCount / item.vehicleCount > 0.05)
    .map((item) => ({
      ...item,
      frequency: (item.failureCount / item.vehicleCount) * 100,
      displayFrequency: (
        (item.failureCount / item.vehicleCount) *
        100
      ).toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }))
    .sort((a, b) => b.frequency - a.frequency)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>High Frequency Failures</CardTitle>
          <CardDescription>
            Failure codes with frequency &gt; 5%
          </CardDescription>
        </div>
        <Select value={selectedModel || 'all'} onValueChange={onModelSelect}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {models.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="w-full overflow-x-auto">
        <ChartContainer config={barChartConfig}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `${value.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}%`
              }
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="failureCode"
              type="category"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Failure Code:</div>
                        <div>{data.failureCode}</div>
                        <div className="font-medium">Frequency:</div>
                        <div>{data.displayFrequency}%</div>
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
                  `${value.toLocaleString('tr-TR', {
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
