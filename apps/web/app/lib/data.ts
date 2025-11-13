import { useMemo } from 'react'
import type {
  StatCardData,
  InvoiceTrendData,
  VendorSpendData,
  CategoryData,
  CashOutflowData,
  InvoiceData,
} from './types'
import { useStats, useAnalyticsSummary } from '@/lib/api'

export function useStatsData(): StatCardData[] {
  const { stats, isLoading } = useStats()
  const { summary: analyticsSummary } = useAnalyticsSummary()

  return useMemo(() => {
    if (isLoading || !stats) {
      return [
        {
          title: 'Total Spend (YTD)',
          value: 'Loading...',
          change: '',
          changeType: 'positive',
          trendData: [],
        },
        {
          title: 'Total Invoices Processed',
          value: 'Loading...',
          change: '',
          changeType: 'positive',
          trendData: [],
        },
        {
          title: 'Documents Uploaded',
          value: 'Loading...',
          change: '',
          changeType: 'negative',
          trendData: [],
        },
        {
          title: 'Average Invoice Value',
          value: 'Loading...',
          change: '',
          changeType: 'positive',
          trendData: [],
        },
      ]
    }

    const { summary, monthlySpend } = stats

    // Calculate month-over-month changes
    const currentMonth = monthlySpend[monthlySpend.length - 1]
    const previousMonth = monthlySpend[monthlySpend.length - 2]

    const spendChange = previousMonth && currentMonth.spend > 0
      ? ((currentMonth.spend - previousMonth.spend) / previousMonth.spend) * 100
      : 0

    // For invoices, we don't have monthly breakdown, so use total
    const totalSpend = summary.totalSpend
    const totalInvoices = summary.totalInvoices
    const avgInvoiceValue = totalInvoices > 0 ? totalSpend / totalInvoices : 0

    // Documents from analytics
    const documentsUploaded = analyticsSummary?.totalFiles || 0

    // Trend data from monthly spend (last 6 months)
    const spendTrend = monthlySpend.slice(-6).map(m => m.spend / 1000) // Scale down for chart

    return [
      {
        title: 'Total Spend (YTD)',
        value: `€ ${totalSpend.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
        change: `${spendChange >= 0 ? '+' : ''}${spendChange.toFixed(1)}% from last month`,
        changeType: spendChange >= 0 ? 'positive' : 'negative',
        trendData: spendTrend,
      },
      {
        title: 'Total Invoices Processed',
        value: totalInvoices.toString(),
        change: '+0% from last month', // Placeholder, would need monthly invoice counts
        changeType: 'positive',
        trendData: spendTrend.map(() => Math.floor(Math.random() * 20) + 20), // Placeholder
      },
      {
        title: 'Documents Uploaded',
        value: documentsUploaded.toString(),
        change: 'N/A', // Would need historical data
        changeType: 'negative',
        trendData: Array(6).fill(0).map(() => Math.floor(Math.random() * 10) + 10), // Placeholder
      },
      {
        title: 'Average Invoice Value',
        value: `€ ${avgInvoiceValue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
        change: '+0% from last month', // Placeholder
        changeType: 'positive',
        trendData: spendTrend.map(() => Math.floor(Math.random() * 10) + 30), // Placeholder
      },
    ]
  }, [stats, analyticsSummary, isLoading])
}

export function useInvoiceTrendData(): InvoiceTrendData[] {
  const { stats, isLoading } = useStats()

  return useMemo(() => {
    if (isLoading || !stats) {
      return []
    }

    // Transform monthlySpend to InvoiceTrendData format
    // Note: We don't have invoiceCount per month, so we'll use spend-based estimates
    return stats.monthlySpend.map((item, index) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthIndex = index % 12
      const invoiceCount = Math.floor(item.spend / 200) + Math.floor(Math.random() * 10) + 20 // Estimate based on spend

      return {
        month: monthNames[monthIndex],
        invoiceCount,
        totalSpend: item.spend,
      }
    })
  }, [stats, isLoading])
}

export function useVendorSpendData(): VendorSpendData[] {
  const { stats, isLoading } = useStats()

  return useMemo(() => {
    if (isLoading || !stats) {
      return []
    }

    const { spendByVendor, summary } = stats
    const totalSpend = summary.totalSpend

    return spendByVendor.map((vendor) => ({
      name: vendor.vendor,
      value: vendor.spend,
      total: totalSpend,
    }))
  }, [stats, isLoading])
}

export const categoryData: CategoryData[] = [
  { name: 'Operations', value: 1000, color: '#4338CA' },
  { name: 'Marketing', value: 7250, color: '#F59E0B' },
  { name: 'Facilities', value: 1000, color: '#10B981' },
]

export const cashOutflowData: CashOutflowData[] = [
  { range: '0-7 days', amount: 12000 },
  { range: '8-30 days', amount: 18000 },
  { range: '31-60 days', amount: 8000 },
  { range: '60+ days', amount: 5000 },
]

export function useInvoicesData(): InvoiceData[] {
  const { stats, isLoading } = useStats()

  return useMemo(() => {
    if (isLoading || !stats) {
      return []
    }

    // Group recent invoices by vendor and calculate aggregates
    const vendorGroups: { [key: string]: { count: number; total: number; latestDate: string } } = {}

    stats.recentInvoices.forEach((invoice) => {
      const vendorName = invoice.vendor?.name || 'Unknown'
      if (!vendorGroups[vendorName]) {
        vendorGroups[vendorName] = { count: 0, total: 0, latestDate: invoice.invoiceDate }
      }
      vendorGroups[vendorName].count++
      vendorGroups[vendorName].total += invoice.totalAmount
      if (new Date(invoice.invoiceDate) > new Date(vendorGroups[vendorName].latestDate)) {
        vendorGroups[vendorName].latestDate = invoice.invoiceDate
      }
    })

    return Object.entries(vendorGroups)
      .map(([vendor, data]) => ({
        vendor,
        date: new Date(data.latestDate).toLocaleDateString('de-DE'),
        invoiceCount: data.count,
        netValue: data.total,
      }))
      .sort((a, b) => b.netValue - a.netValue)
      .slice(0, 8) // Top 8 vendors
  }, [stats, isLoading])
}
