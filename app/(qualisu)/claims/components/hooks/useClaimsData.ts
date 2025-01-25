'use client'

import { useState, useEffect } from 'react'
import { Claim } from '../../columns'
import { getFormattedDate, parseDate, periods } from '../utils'

interface ChartDataPoint {
  type: string
  value: number
  descEng?: string
  descTurk?: string
}

interface TimeSeriesDataPoint {
  time: string
  amount: number
}

interface ActiveFilters {
  date: string | null
  failureCode: string | null
  dealer: string | null
}

interface UseClaimsDataReturn {
  period: string
  showOthers: boolean
  showDealerOthers: boolean
  selectedDate: string
  activeFilters: ActiveFilters
  claimTypeData: ChartDataPoint[]
  failureCodeData: ChartDataPoint[]
  dealerData: ChartDataPoint[]
  timeData: TimeSeriesDataPoint[]
  handlePeriodChange: (value: string) => void
  handleToggleOthers: () => void
  handleToggleDealerOthers: () => void
  handleItemClick: (
    type: 'date' | 'failureCode' | 'dealer',
    value: string
  ) => void
}

export const useClaimsData = (claims: Claim[] = []): UseClaimsDataReturn => {
  const [period, setPeriod] = useState(periods[0].value)
  const [showOthers, setShowOthers] = useState(false)
  const [showDealerOthers, setShowDealerOthers] = useState(false)

  // Find initial date
  const initialDate = claims.reduce((lastDate, claim) => {
    const claimDate = new Date(claim.claimDate || '')
    const formattedDate = getFormattedDate(claimDate, 'monthly')
    if (!lastDate || parseDate(formattedDate) > parseDate(lastDate)) {
      return formattedDate
    }
    return lastDate
  }, '')

  const [selectedDate, setSelectedDate] = useState<string>(initialDate)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    date: initialDate,
    failureCode: null,
    dealer: null
  })

  const [timeData, setTimeData] = useState<TimeSeriesDataPoint[]>([])
  const [failureCodeData, setFailureCodeData] = useState<ChartDataPoint[]>([])
  const [dealerData, setDealerData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    // Process time series data
    const processedTimeData = processTimeSeriesData(claims, period)
    setTimeData(processedTimeData)

    // Get filtered claims based on active filters
    const filteredClaims = claims.filter((claim) => {
      const dateMatch =
        !activeFilters.date ||
        getFormattedDate(new Date(claim.claimDate || ''), period) ===
          activeFilters.date

      const failureCodeMatch =
        !activeFilters.failureCode ||
        claim.failureCode === activeFilters.failureCode

      const dealerMatch =
        !activeFilters.dealer || claim.dealerName === activeFilters.dealer

      return dateMatch && failureCodeMatch && dealerMatch
    })

    // Process failure code data with filtered claims
    const processedFailureData = processFailureCodeData(
      filteredClaims,
      showOthers
    )
    setFailureCodeData(
      processedFailureData.map((item) => ({
        type: item.code,
        value: item.count,
        descEng: item.descEng,
        descTurk: item.descTurk
      }))
    )

    // Process dealer data with filtered claims
    const processedDealerData = processDealerData(
      filteredClaims,
      showDealerOthers
    )
    setDealerData(
      processedDealerData.map((item) => ({
        type: item.dealerName || 'Unknown',
        value: item.count
      }))
    )
  }, [claims, period, showOthers, showDealerOthers, activeFilters])

  const filteredClaims = claims.filter((claim) => {
    const dateMatch =
      !activeFilters.date ||
      getFormattedDate(new Date(claim.claimDate || ''), period) ===
        activeFilters.date

    const failureCodeMatch =
      !activeFilters.failureCode ||
      claim.failureCode === activeFilters.failureCode

    const dealerMatch =
      !activeFilters.dealer || claim.dealerName === activeFilters.dealer

    return dateMatch && failureCodeMatch && dealerMatch
  })

  const claimTypeData = filteredClaims.reduce(
    (acc: ChartDataPoint[], claim) => {
      const type = 'General' // Default type since claimType is not available
      const existingType = acc.find((item) => item.type === type)
      if (existingType) {
        existingType.value += 1
      } else {
        acc.push({ type, value: 1 })
      }
      return acc
    },
    []
  )

  const handlePeriodChange = (value: string) => {
    setPeriod(value as typeof period)
    const newDate = getFormattedDate(new Date(), value)
    setSelectedDate(newDate)
    setActiveFilters((prev) => ({ ...prev, date: newDate }))
  }

  const handleToggleOthers = () => setShowOthers(!showOthers)
  const handleToggleDealerOthers = () => setShowDealerOthers(!showDealerOthers)

  const handleItemClick = (
    type: 'date' | 'failureCode' | 'dealer',
    value: string
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }))

    if (type === 'date') {
      setSelectedDate(value)
    }
  }

  return {
    period,
    showOthers,
    showDealerOthers,
    selectedDate,
    activeFilters,
    claimTypeData,
    failureCodeData,
    dealerData,
    timeData,
    handlePeriodChange,
    handleToggleOthers,
    handleToggleDealerOthers,
    handleItemClick
  }
}

function processTimeSeriesData(
  claims: Claim[],
  period: string
): TimeSeriesDataPoint[] {
  const timeGroups = claims.reduce((acc: { [key: string]: number }, claim) => {
    if (!claim.claimDate) return acc
    const date = new Date(claim.claimDate)
    const timeKey = getFormattedDate(date, period)
    acc[timeKey] = (acc[timeKey] || 0) + (claim.amount || 0)
    return acc
  }, {})

  return Object.entries(timeGroups)
    .map(([time, amount]) => ({ time, amount }))
    .sort((a, b) => {
      // Parse dates based on period format
      if (period === 'weekly') {
        const [yearA, weekA] = a.time.split('-W')
        const [yearB, weekB] = b.time.split('-W')
        // Compare years first
        if (yearA !== yearB) {
          return yearA.localeCompare(yearB)
        }
        // Then compare week numbers
        return parseInt(weekA) - parseInt(weekB)
      }

      // For other periods, use standard date comparison
      return parseDate(a.time).getTime() - parseDate(b.time).getTime()
    })
}

function processFailureCodeData(claims: Claim[], showOthers: boolean) {
  const groups = claims.reduce(
    (
      acc: {
        [key: string]: { count: number; descEng?: string; descTurk?: string }
      },
      claim
    ) => {
      const code = claim.failureCode || 'Unknown'
      if (!acc[code]) {
        acc[code] = {
          count: 0,
          descEng: claim.failures?.descEng,
          descTurk: claim.failures?.descTurk
        }
      }
      acc[code].count += claim.amount || 0
      return acc
    },
    {}
  )

  const data = Object.entries(groups)
    .map(([code, { count, descEng, descTurk }]) => ({
      code,
      count,
      descEng,
      descTurk
    }))
    .sort((a, b) => b.count - a.count)

  return showOthers ? data : data.slice(0, 10)
}

function processDealerData(claims: Claim[], showOthers: boolean) {
  const groups = claims.reduce((acc: { [key: string]: number }, claim) => {
    const dealerName = claim.dealerName || 'Unknown'
    acc[dealerName] = (acc[dealerName] || 0) + (claim.amount || 0)
    return acc
  }, {})

  const data = Object.entries(groups)
    .map(([dealerName, count]) => ({ dealerName, count }))
    .sort((a, b) => b.count - a.count)

  return showOthers ? data : data.slice(0, 10)
}
