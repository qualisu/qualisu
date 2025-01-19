'use client'

import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
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
import { useState } from 'react'
import { Claim } from '../columns'
import { Button } from '@/components/ui/button'

interface ClaimsAnalyticsProps {
  claims: Claim[]
}

const periods = [
  { value: 'daily', label: 'Günlük' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'yearly', label: 'Yıllık' }
]

export const ClaimsAnalytics = ({ claims = [] }: ClaimsAnalyticsProps) => {
  const [period, setPeriod] = useState('monthly')
  const [showOthers, setShowOthers] = useState(false)

  const getFormattedDate = (date: Date) => {
    if (!date) return ''
    try {
      switch (period) {
        case 'daily':
          return format(date, 'dd/MM/yyyy')
        case 'monthly':
          return format(date, 'MM/yyyy')
        case 'yearly':
          return format(date, 'yyyy')
        default:
          return format(date, 'MM/yyyy')
      }
    } catch (error) {
      return ''
    }
  }

  const [selectedDate, setSelectedDate] = useState<string>(
    getFormattedDate(new Date())
  )

  const claimTypeData = (claims || []).reduce((acc: any[], claim) => {
    if (!claim?.claimType) return acc
    const existingType = acc.find((item) => item.type === claim.claimType)
    if (existingType) {
      existingType.value += 1
    } else {
      acc.push({ type: claim.claimType, value: 1 })
    }
    return acc
  }, [])

  const failureCodeData = (claims || [])
    .reduce((acc: any[], claim) => {
      if (!claim?.failureCode || !claim?.amount || !claim?.claimDate) return acc

      const claimDate = new Date(claim.claimDate)
      const timeKey = getFormattedDate(claimDate)
      if (!timeKey) return acc

      const existingCode = acc.find((item) => item.type === claim.failureCode)
      if (existingCode) {
        existingCode.value += Number(claim.amount.toFixed(2))
      } else {
        acc.push({
          type: claim.failureCode,
          value: Number(claim.amount.toFixed(2)),
          period: timeKey
        })
      }
      return acc
    }, [])
    .filter((item) => item.period === selectedDate)
    .sort((a, b) => b.value - a.value)
    .reduce((acc: any[], item, index) => {
      if (!showOthers) {
        if (index < 10) {
          acc.push(item)
        } else if (acc.length === 10) {
          acc.push({ type: 'Others', value: item.value })
        } else {
          acc[10].value += item.value
        }
      } else {
        if (index >= 10) {
          acc.push(item)
        }
      }
      return acc
    }, [])

  const barChartConfig = {
    amount: {
      label: 'Amount',
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig

  const failureCodeChartConfig = failureCodeData.reduce(
    (config: any, item, index) => {
      config[item.type] = {
        label: item.type,
        color: 'hsl(var(--chart-2))'
      }
      return config
    },
    {}
  )

  const chartConfig: ChartConfig = claimTypeData.reduce(
    (config: any, claim, index) => {
      const hue = (index * 60) % 360
      config[claim.type] = {
        label: claim.type,
        color: `hsl(${hue}, 70%, 50%)`
      }
      return config
    },
    {}
  )

  const timeData = (claims || [])
    .reduce((acc: any[], claim) => {
      if (!claim?.claimDate || !claim?.amount) return acc
      const timeKey = getFormattedDate(new Date(claim.claimDate))
      if (!timeKey) return acc
      const existingTime = acc.find((item) => item.time === timeKey)
      if (existingTime) {
        existingTime.amount += claim.amount
      } else {
        acc.push({ time: timeKey, amount: claim.amount })
      }
      return acc
    }, [])
    .sort((a, b) => {
      const parseDate = (str: string) => {
        if (!str) return new Date()
        const parts = str.split('/')
        try {
          switch (period) {
            case 'daily':
              return new Date(
                Number(parts[2]),
                Number(parts[1]) - 1,
                Number(parts[0])
              )
            case 'monthly':
              return new Date(Number(parts[1]), Number(parts[0]) - 1)
            case 'yearly':
              return new Date(Number(parts[0]), 0)
            default:
              return new Date(Number(parts[1]), Number(parts[0]) - 1)
          }
        } catch (error) {
          return new Date()
        }
      }
      return parseDate(a.time).getTime() - parseDate(b.time).getTime()
    })

  if (!claims?.length) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims Over Time</CardTitle>
            <CardDescription>No claims data available</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Claim Types</CardTitle>
            <CardDescription>No claims data available</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
          <Select
            value={period}
            onValueChange={(value) => {
              setPeriod(value)
              setSelectedDate(getFormattedDate(new Date()))
            }}
          >
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
              data={timeData}
              onClick={(data) => {
                if (data?.activeLabel) {
                  setSelectedDate(data.activeLabel)
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
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }),
                  'Amount'
                ]}
              />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Claim Types</CardTitle>
          <CardDescription>Distribution by type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <Tooltip />
              <Pie
                data={claimTypeData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => entry.type}
              >
                {claimTypeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartConfig[entry.type].color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Failure Codes</CardTitle>
            <CardDescription>Distribution by failure code</CardDescription>
          </div>
          {showOthers && (
            <Button
              onClick={() => setShowOthers(false)}
              variant="outline"
              size="sm"
            >
              Clear
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ChartContainer config={failureCodeChartConfig}>
            <BarChart
              accessibilityLayer
              data={failureCodeData}
              layout="vertical"
              margin={{ left: 120 }}
              onClick={(data) => {
                if (data?.activePayload?.[0]?.payload?.type === 'Others') {
                  setShowOthers(true)
                }
              }}
            >
              <YAxis
                dataKey="type"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
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
              />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
