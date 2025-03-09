import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
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
import { TimeSeriesDataPoint } from './types'
import { periods } from './utils'

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[]
  period: string
  activeFilters: {
    date: string | null
    failureCode: string | null
    dealer: string | null
  }
  onPeriodChange: (value: string) => void
  onItemClick: (type: 'date' | 'failureCode' | 'dealer', value: string) => void
}

export const TimeSeriesChart = ({
  data,
  period,
  activeFilters,
  onPeriodChange,
  onItemClick
}: TimeSeriesChartProps) => {
  const barChartConfig = {
    amount: {
      label: 'Amount',
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig

  const chartData = data.map((item) => ({
    ...item,
    opacity: activeFilters.date && activeFilters.date !== item.time ? 0.3 : 1
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            Claims By {periods.find((p) => p.value === period)?.label}
          </CardTitle>
          <CardDescription>
            Total amount by {periods.find((p) => p.value === period)?.label}
          </CardDescription>
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={barChartConfig}>
          <BarChart
            data={chartData}
            onClick={(data) => {
              if (data?.activeLabel) {
                onItemClick('date', data.activeLabel)
              }
            }}
          >
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
                value.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }),
                'Amount'
              ]}
            />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={8}
              className={activeFilters.date ? 'cursor-pointer' : ''}
              fillOpacity="opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
