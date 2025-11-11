export interface StatCardData {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  trendData: number[]
}

export interface InvoiceTrendData {
  month: string
  invoiceCount: number
  totalSpend: number
}

export interface VendorSpendData {
  name: string
  value: number
  total: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface CashOutflowData {
  range: string
  amount: number
}

export interface InvoiceData {
  vendor: string
  date: string
  invoiceCount: number
  netValue: number
}
