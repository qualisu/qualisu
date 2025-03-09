import { format } from 'date-fns'

export const periods = [
  { value: 'daily', label: 'Day' },
  { value: 'weekly', label: 'Week' },
  { value: 'monthly', label: 'Month' },
  { value: 'yearly', label: 'Year' }
] as const

export function getFormattedDate(date: Date, period: string): string {
  switch (period) {
    case 'daily':
      return date.toISOString().split('T')[0]
    case 'weekly':
      const week = getWeekNumber(date)
      return `${date.getFullYear()}-W${week}`
    case 'monthly':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}`
    case 'yearly':
      return `${date.getFullYear()}`
    default:
      return date.toISOString().split('T')[0]
  }
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export interface TrendAnalysis {
  type: 'model' | 'country'
  name: string
  increasePercentage: number
  period: string
}

export const analyzeTrends = (
  data: { time: string; amount: number }[],
  threshold: number = 1
): TrendAnalysis[] => {
  if (data.length < 2) return []

  const trends: TrendAnalysis[] = []
  const currentPeriod = data[data.length - 1]
  const previousPeriod = data[data.length - 2]

  if (!currentPeriod || !previousPeriod) return []

  const increasePercentage =
    ((currentPeriod.amount - previousPeriod.amount) / previousPeriod.amount) *
    100

  if (increasePercentage > threshold) {
    trends.push({
      type: 'model', // or 'country' depending on the data
      name: currentPeriod.time,
      increasePercentage: Math.round(increasePercentage * 100) / 100,
      period: `${previousPeriod.time} - ${currentPeriod.time}`
    })
  }

  return trends
}

export const sendTrendNotification = async (
  trends: TrendAnalysis[],
  recipients: string[]
) => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipients,
        subject: 'Qualisu - Önemli Trend Bildirimi',
        trends: trends
      })
    })

    return response.json()
  } catch (error) {
    console.error('Trend bildirimi gönderilemedi:', error)
    throw error
  }
}
