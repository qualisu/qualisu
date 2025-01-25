'use client'

import { Claim } from '../columns'
import { TimeSeriesChart } from './TimeSeriesChart'
import { FailureCodesBarChart } from './FailureCodesBarChart'
import { FailureFrequencyChart } from './FailureFrequencyChart'
import { DealerBarChart } from './DealerBarChart'
import { FailureFrequencyCountryChart } from './FailureFrequencyCountryChart'
import { useClaimsData } from './hooks/useClaimsData'
import { getFormattedDate } from './utils'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VehiclesColumn } from '../../parameters/vehicles/columns'
import { useState, useEffect, useRef } from 'react'
import { analyzeTrends, sendTrendNotification, TrendAnalysis } from './utils'
import { toast } from 'sonner'
import { toPng } from 'html-to-image'

interface ClaimsAnalyticsProps {
  claims: Claim[]
  vehicles: VehiclesColumn[]
}

export const ClaimsAnalytics = ({
  claims = [],
  vehicles = []
}: ClaimsAnalyticsProps) => {
  const [selectedFailureCode, setSelectedFailureCode] = useState<string | null>(
    null
  )
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const analyticsRef = useRef<HTMLDivElement>(null)

  const {
    period,
    timeData,
    failureCodeData,
    dealerData,
    showOthers,
    showDealerOthers,
    activeFilters,
    handlePeriodChange,
    handleToggleOthers,
    handleToggleDealerOthers,
    handleItemClick
  } = useClaimsData(claims)

  const handleTrendAnalysis = async () => {
    if (!selectedFailureCode) {
      toast.error('Lütfen bir arıza kodu seçin')
      return
    }

    setIsAnalyzing(true)
    try {
      // Capture screenshot
      let imageData = null
      if (analyticsRef.current) {
        try {
          const dataUrl = await toPng(analyticsRef.current, {
            quality: 0.95,
            backgroundColor: 'white'
          })
          imageData = dataUrl
        } catch (error) {
          console.error('Screenshot alınamadı:', error)
        }
      }

      const significantModels = failureFrequencyData
        .filter((item) => item.frequency * 100 > 5)
        .map((item) => ({
          type: 'model' as const,
          name: item.model,
          increasePercentage: Math.round(item.frequency * 10000) / 100,
          period: selectedFailureCode
            ? `Failure Code: ${selectedFailureCode}`
            : 'N/A',
          additionalInfo: {
            failureCount: item.failureCount,
            vehicleCount: item.vehicleCount
          }
        }))

      console.log('Trend Analizi Sonuçları:', {
        significantModels,
        rawData: {
          failureFrequencyData,
          selectedFailureCode
        }
      })

      if (significantModels.length > 0) {
        const mailData = {
          subject: `Qualisu - Yüksek Arıza Oranı Bildirimi (${selectedFailureCode})`,
          trends: significantModels.map((model) => ({
            ...model,
            message: `${model.name} modelinde ${model.additionalInfo.failureCount} adet arıza (${model.increasePercentage}%) tespit edildi. Toplam araç sayısı: ${model.additionalInfo.vehicleCount}`
          })),
          imageData // Add screenshot data to the request
        }

        console.log('Mail gönderilecek:', mailData)
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mailData)
        })

        if (!response.ok) {
          throw new Error('Mail gönderimi başarısız oldu')
        }

        const result = await response.json()
        console.log('Mail gönderim sonucu:', result)
        toast.success('Trend analizi raporu mail olarak gönderildi')
      } else {
        toast.info(
          'Kritik seviyede (%5 üzeri) arıza oranı olan model bulunamadı'
        )
      }
    } catch (error) {
      console.error('Trend bildirimi gönderilemedi:', error)
      toast.error('Trend bildirimi gönderilemedi')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Update handleItemClick to set selectedDate
  const handleChartItemClick = (
    type: 'date' | 'failureCode' | 'dealer',
    value: string
  ) => {
    if (type === 'date') {
      setSelectedDate(value)
    }
    handleItemClick(type, value)
  }

  // Calculate failure frequencies when a failure code is selected
  const failureFrequencyData = selectedFailureCode
    ? (() => {
        // Count vehicles by model that are within warranty period for the selected date
        const vehiclesByModel = vehicles.reduce(
          (acc: { [key: string]: Set<string> }, vehicle) => {
            // Check if the vehicle is within warranty period for the selected date
            if (selectedDate && activeFilters.date) {
              const date = new Date(activeFilters.date)
              const warStart = vehicle.warStart
                ? new Date(vehicle.warStart)
                : null
              const warEnd = vehicle.warEnd ? new Date(vehicle.warEnd) : null

              if (warStart && warEnd && date >= warStart && date <= warEnd) {
                // Use vehicle model as key but count unique VINs
                const model = vehicle.vehicleModel
                if (!acc[model]) {
                  acc[model] = new Set()
                }
                acc[model].add(vehicle.saseNo)
              }
            } else {
              // Use vehicle model as key but count unique VINs
              const model = vehicle.vehicleModel
              if (!acc[model]) {
                acc[model] = new Set()
              }
              acc[model].add(vehicle.saseNo)
            }
            return acc
          },
          {} as { [key: string]: Set<string> }
        )

        // Convert Sets to counts
        const vehicleCounts = Object.fromEntries(
          Object.entries(vehiclesByModel).map(([model, vins]) => [
            model,
            vins.size
          ])
        )

        // Count claims by model for the selected failure code and date
        const claimsByModel = claims
          .filter((claim) => {
            const matchesFailureCode = claim.failureCode === selectedFailureCode
            const matchesDate =
              selectedDate && activeFilters.date
                ? getFormattedDate(new Date(claim.claimDate), period) ===
                  activeFilters.date
                : true

            return matchesFailureCode && matchesDate
          })
          .reduce((acc: { [key: string]: number }, claim) => {
            if (claim.vehicleModel) {
              acc[claim.vehicleModel] = (acc[claim.vehicleModel] || 0) + 1
            }
            return acc
          }, {})

        // Calculate frequencies and filter out zero frequencies
        return Object.entries(vehicleCounts)
          .map(([model, vehicleCount]) => ({
            model,
            frequency: (claimsByModel[model] || 0) / vehicleCount,
            failureCount: claimsByModel[model] || 0,
            vehicleCount
          }))
          .filter((item) => item.frequency > 0)
          .sort((a, b) => b.frequency - a.frequency)
      })()
    : []

  // Calculate country-based failure frequencies when a failure code is selected
  const countryFailureFrequencyData = selectedFailureCode
    ? (() => {
        // Get filtered claims based on selected model
        const filteredClaims = selectedModel
          ? claims.filter((claim) => claim.vehicleModel === selectedModel)
          : claims

        // Get unique countries from filtered claims
        const countries = Array.from(
          new Set(filteredClaims.map((claim) => claim.country))
        )

        // Calculate frequencies for each country
        const countryData = countries
          .map((country) => {
            // Get all unique VINs for this country from claims
            const countryVins = Array.from(
              new Set(
                claims
                  .filter(
                    (claim) =>
                      claim.country === country &&
                      (!selectedModel || claim.vehicleModel === selectedModel)
                  )
                  .map((claim) => claim.saseNo)
              )
            )

            // Get failure code claims for this country
            const failureClaims = filteredClaims.filter(
              (claim) =>
                claim.country === country &&
                claim.failureCode === selectedFailureCode
            )

            const vehicleCount = countryVins.length
            const failureCount = failureClaims.length

            return {
              country,
              frequency: failureCount / vehicleCount,
              failureCount,
              vehicleCount
            }
          })
          .filter((item) => item.frequency > 0)
          .sort((a, b) => b.frequency - a.frequency)

        return countryData
      })()
    : []

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
    <div className="space-y-4" ref={analyticsRef}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Claims Analytics</h2>
        <Button
          onClick={handleTrendAnalysis}
          variant="outline"
          disabled={isAnalyzing || !selectedFailureCode}
        >
          {isAnalyzing ? 'Analiz Yapılıyor...' : 'Trend Analizi Yap'}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <TimeSeriesChart
          data={timeData}
          period={period}
          activeFilters={activeFilters}
          onPeriodChange={handlePeriodChange}
          onItemClick={handleChartItemClick}
        />
        {/* <WarrantyVehiclesChart vehicles={vehicles} selectedDate={selectedDate} /> */}
        <FailureCodesBarChart
          data={failureCodeData}
          showOthers={showOthers}
          activeFilters={activeFilters}
          onToggleOthers={handleToggleOthers}
          onItemClick={handleItemClick}
          onFailureCodeSelect={setSelectedFailureCode}
        />
        <FailureFrequencyChart
          data={failureFrequencyData}
          selectedFailureCode={selectedFailureCode}
          selectedDate={selectedDate}
          onModelSelect={setSelectedModel}
        />
        <FailureFrequencyCountryChart
          data={countryFailureFrequencyData}
          selectedFailureCode={selectedFailureCode}
          selectedModel={selectedModel}
        />
        <DealerBarChart
          data={dealerData}
          showOthers={showDealerOthers}
          activeFilters={activeFilters}
          onToggleOthers={handleToggleDealerOthers}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  )
}
