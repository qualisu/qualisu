import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import { ChartDataPoint } from './types'

interface DealerBarChartProps {
  data: ChartDataPoint[]
  showOthers: boolean
  activeFilters: {
    date: string | null
    failureCode: string | null
    dealer: string | null
  }
  onToggleOthers: () => void
  onItemClick: (type: 'date' | 'failureCode' | 'dealer', value: string) => void
}

export const DealerBarChart = ({
  data,
  showOthers,
  activeFilters,
  onToggleOthers,
  onItemClick
}: DealerBarChartProps) => {
  const chartConfig = data.reduce((config: any, item) => {
    config[item.type] = {
      label: item.type,
      color: 'hsl(var(--chart-3))'
    }
    return config
  }, {})

  const chartData = data.map((item) => ({
    ...item,
    opacity:
      activeFilters.dealer && activeFilters.dealer !== item.type ? 0.3 : 1
  }))

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Dealers</CardTitle>
          <CardDescription>Distribution by dealer</CardDescription>
        </div>
        {showOthers && (
          <Button onClick={onToggleOthers} variant="outline" size="sm">
            Clear
          </Button>
        )}
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 50, right: 50, top: 0, bottom: 0 }}
            width={600}
            onClick={(data) => {
              const type = data?.activePayload?.[0]?.payload?.type
              if (type === 'Others') {
                onToggleOthers()
              } else if (type) {
                onItemClick('dealer', type)
              }
            }}
          >
            <YAxis
              dataKey="type"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              style={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value) => {
                if (value.length > 10) {
                  return value.slice(0, 10) + '...'
                }
                return value
              }}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              style={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value) =>
                value.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })
              }
            />
            <Tooltip
              formatter={(value: number) => [
                value.toLocaleString('tr-TR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }),
                'Amount'
              ]}
              labelFormatter={(label) => (
                <span style={{ color: 'hsl(var(--chart-4))' }}>
                  Dealer: {label}
                </span>
              )}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-4))"
              radius={8}
              className={activeFilters.dealer ? 'cursor-pointer' : ''}
              fillOpacity="opacity"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
