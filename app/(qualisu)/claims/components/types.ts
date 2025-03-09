export interface Claim {
  claimType?: string
  failureCode?: string
  amount?: number
  claimDate?: string | Date
  dealerName?: string
  vehicleModel?: string
}

export interface ChartDataPoint {
  type: string
  value: number
  period?: string
}

export interface TimeSeriesDataPoint {
  time: string
  amount: number
}

export interface Period {
  value: string
  label: string
}
