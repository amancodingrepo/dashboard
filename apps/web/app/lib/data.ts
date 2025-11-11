import type {
  StatCardData,
  InvoiceTrendData,
  VendorSpendData,
  CategoryData,
  CashOutflowData,
  InvoiceData,
} from './types'

export const statsData: StatCardData[] = [
  {
    title: 'Total Spend (YTD)',
    value: '€ 12.679,25',
    change: '+8.2% from last month',
    changeType: 'positive',
    trendData: [30, 40, 35, 50, 49, 60, 70, 91],
  },
  {
    title: 'Total Invoices Processed',
    value: '64',
    change: '+8.2% from last month',
    changeType: 'positive',
    trendData: [20, 25, 30, 35, 40, 45, 50, 55],
  },
  {
    title: 'Documents Uploaded',
    value: '17',
    change: '-8 less from last month',
    changeType: 'negative',
    trendData: [50, 45, 40, 35, 30, 25, 20, 15],
  },
  {
    title: 'Average Invoice Value',
    value: '€ 2.455,00',
    change: '+8.2% from last month',
    changeType: 'positive',
    trendData: [30, 35, 40, 38, 42, 45, 48, 50],
  },
]

export const invoiceTrendData: InvoiceTrendData[] = [
  { month: 'Jan', invoiceCount: 35, totalSpend: 6500 },
  { month: 'Feb', invoiceCount: 42, totalSpend: 7800 },
  { month: 'Mar', invoiceCount: 38, totalSpend: 7200 },
  { month: 'Apr', invoiceCount: 50, totalSpend: 9500 },
  { month: 'May', invoiceCount: 48, totalSpend: 9000 },
  { month: 'Jun', invoiceCount: 55, totalSpend: 10500 },
  { month: 'Jul', invoiceCount: 60, totalSpend: 11000 },
  { month: 'Aug', invoiceCount: 65, totalSpend: 11200 },
  { month: 'Sep', invoiceCount: 55, totalSpend: 9800 },
  { month: 'Oct', invoiceCount: 47, totalSpend: 9200 },
  { month: 'Nov', invoiceCount: 35, totalSpend: 8000 },
  { month: 'Dec', invoiceCount: 40, totalSpend: 8679 },
]

export const vendorSpendData: VendorSpendData[] = [
  { name: 'ActionsOne', value: 45000, total: 50000 },
  { name: 'Test Solutions', value: 43000, total: 50000 },
  { name: 'PrimeVendors', value: 38000, total: 50000 },
  { name: 'GlobalAcces', value: 32000, total: 50000 },
  { name: 'OmegaLtd', value: 30000, total: 50000 },
  { name: 'Global Supply', value: 8679, total: 50000 },
  { name: 'OmegaUS', value: 7500, total: 50000 },
  { name: 'OmegaL12', value: 7000, total: 50000 },
]

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

export const invoicesData: InvoiceData[] = [
  { vendor: 'Phunix GmbH', date: '19.08.2025', invoiceCount: 12, netValue: 736784.40 },
  { vendor: 'ActionsOne', date: '15.08.2025', invoiceCount: 8, netValue: 645200.00 },
  { vendor: 'Test Solutions', date: '10.08.2025', invoiceCount: 15, netValue: 543000.00 },
  { vendor: 'GlobalAcces', date: '05.08.2025', invoiceCount: 6, netValue: 432100.00 },
  { vendor: 'OmegaLtd', date: '01.08.2025', invoiceCount: 10, netValue: 380500.00 },
  { vendor: 'Global Supply', date: '28.07.2025', invoiceCount: 4, netValue: 298400.00 },
  { vendor: 'OmegaUS', date: '25.07.2025', invoiceCount: 7, netValue: 225600.00 },
  { vendor: 'OmegaL12', date: '20.07.2025', invoiceCount: 5, netValue: 187300.00 },
]
