import useSWR from 'swr'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export interface StatsData {
  summary: {
    totalVendors: number
    totalCustomers: number
    totalInvoices: number
    totalSpend: number
  }
  monthlySpend: Array<{
    month: string
    spend: number
  }>
  spendByVendor: Array<{
    vendor: string
    spend: number
  }>
  recentInvoices: Array<{
    id: number
    invoiceRef: string
    invoiceDate: string
    totalAmount: number
    vendor?: { name: string }
    customer?: { name: string }
  }>
  timestamp: string
}

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<StatsData>(
    `${API_BASE_URL}/stats`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    refresh: mutate,
  }
}

export function useAnalyticsSummary() {
  const { data, error, isLoading } = useSWR(
    `${API_BASE_URL}/analytics/summary`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  )

  return {
    summary: data,
    isLoading,
    error,
  }
}
