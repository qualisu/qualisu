import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { VehiclesColumn } from '../../parameters/vehicles/columns'

interface WarrantyVehiclesChartProps {
  vehicles: VehiclesColumn[]
  selectedDate: string | null
}

export const WarrantyVehiclesChart = ({
  vehicles,
  selectedDate
}: WarrantyVehiclesChartProps) => {
  const barChartConfig = {
    ratio: {
      label: 'Warranty Ratio',
      color: 'hsl(var(--chart-3))'
    }
  } satisfies ChartConfig

  const chartData = selectedDate
    ? (() => {
        const date = new Date(selectedDate)

        // Group vehicles by model and count warranty status
        const modelStats = vehicles.reduce(
          (
            acc: { [key: string]: { total: number; inWarranty: number } },
            vehicle
          ) => {
            const warStart = new Date(vehicle.warStart)
            const warEnd = new Date(vehicle.warEnd)
            const isInWarranty = date >= warStart && date <= warEnd

            if (!acc[vehicle.vehicleModel]) {
              acc[vehicle.vehicleModel] = { total: 0, inWarranty: 0 }
            }

            acc[vehicle.vehicleModel].total++
            if (isInWarranty) {
              acc[vehicle.vehicleModel].inWarranty++
            }

            return acc
          },
          {}
        )

        // Convert to chart data format and calculate ratios
        return Object.entries(modelStats)
          .map(([model, stats]) => ({
            model,
            ratio: (stats.inWarranty / stats.total) * 100,
            inWarranty: stats.inWarranty,
            total: stats.total
          }))
          .sort((a, b) => b.ratio - a.ratio)
      })()
    : []

  if (!selectedDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warranty Vehicle Ratios</CardTitle>
          <CardDescription>
            Select a date to see warranty ratios by model
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Warranty Vehicle Ratios</CardTitle>
        <CardDescription>
          Percentage of vehicles under warranty by model for {selectedDate}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={barChartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="model"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              formatter={(value: number) => [
                `${value.toFixed(1)}%`,
                'Warranty Ratio'
              ]}
            />
            <Bar dataKey="ratio" fill="var(--color-ratio)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
