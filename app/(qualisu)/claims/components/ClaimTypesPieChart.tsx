'use client'

import { PieChart, Pie, Cell } from 'recharts'
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
import { ChartDataPoint } from './types'

interface ClaimTypesPieChartProps {
  data: ChartDataPoint[]
}

// Önceden tanımlanmış renkler
const COLORS = [
  '#FF6B6B', // Kırmızı
  '#4ECDC4', // Turkuaz
  '#45B7D1', // Mavi
  '#96CEB4', // Yeş il
  '#FFEEAD', // Sarı
  '#D4A5A5', // Pembe
  '#9B59B6', // Mor
  '#3498DB', // Koyu Mavi
  '#E67E22', // Turuncu
  '#2ECC71' // Koyu Yeşil
]

export const ClaimTypesPieChart = ({ data }: ClaimTypesPieChartProps) => {
  const chartConfig: ChartConfig = data.reduce((config: any, claim, index) => {
    config[claim.type] = {
      label: claim.type,
      color: COLORS[index % COLORS.length]
    }
    return config
  }, {})

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Claim Types</CardTitle>
        <CardDescription>Distribution by type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[400px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={data} dataKey="value" nameKey="type">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
