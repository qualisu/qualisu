import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { ChartDataPoint } from './types'
import { useState } from 'react'

interface ExtendedChartDataPoint extends ChartDataPoint {
  descEng?: string
  descTurk?: string
}

interface FailureCodesBarChartProps {
  data: ExtendedChartDataPoint[]
  showOthers: boolean
  activeFilters: {
    date: string | null
    failureCode: string | null
    dealer: string | null
  }
  onToggleOthers: () => void
  onItemClick: (type: 'date' | 'failureCode' | 'dealer', value: string) => void
  onFailureCodeSelect: (code: string | null) => void
}

export const FailureCodesBarChart = ({
  data,
  showOthers,
  activeFilters,
  onToggleOthers,
  onItemClick,
  onFailureCodeSelect
}: FailureCodesBarChartProps) => {
  const [selectedFailureCode, setSelectedFailureCode] = useState<string | null>(
    null
  )

  // Limit data to top 20 items when showing Others
  const limitedData = showOthers ? data.slice(0, 20) : data

  const chartConfig = limitedData.reduce((config: any, item) => {
    config[item.type] = {
      label: item.type,
      color: 'hsl(var(--chart-2))'
    }
    return config
  }, {})

  const chartData = limitedData.map((item) => ({
    ...item,
    opacity: selectedFailureCode && selectedFailureCode !== item.type ? 0.3 : 1
  }))

  // Calculate dynamic height based on number of items (50px per item with minimum of 400px)
  const chartHeight = Math.max(400, chartData.length * 50)

  const handleClick = (type: string | undefined) => {
    if (!type) return

    if (type === 'Others') {
      // For Others, show the detailed list and reset opacity
      onToggleOthers()
      setSelectedFailureCode(null)
      onFailureCodeSelect(null)
    } else {
      // For failure codes, only handle opacity and update frequency chart
      const newSelectedCode = selectedFailureCode === type ? null : type
      setSelectedFailureCode(newSelectedCode)
      onFailureCodeSelect(newSelectedCode)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold">{data.type}</p>
          <p className="text-sm text-gray-600 mt-1">
            {data.value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
          </p>
          {data.descEng && (
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-medium">EN:</span> {data.descEng}
            </p>
          )}
          {data.descTurk && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">TR:</span> {data.descTurk}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Failure Codes</CardTitle>
          <CardDescription>Distribution by failure code</CardDescription>
        </div>
        {showOthers && (
          <Button onClick={onToggleOthers} variant="outline" size="sm">
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            height={chartHeight}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onClick={(data) => {
              const type = data?.activePayload?.[0]?.payload?.type
              handleClick(type)
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={110}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value.toLocaleString('tr-TR', {
                  maximumFractionDigits: 0
                })
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-2))"
              radius={8}
              className="cursor-pointer"
              opacity="opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
