'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useVendorSpendData } from '@/app/lib/data'

interface VendorData {
  name: string
  spend: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-custom-slate-200 bg-white p-3 shadow-md">
        <p className="mb-1 text-sm font-medium text-custom-slate-800">
          {payload[0].payload.name}
        </p>
        <p className="text-xs text-custom-slate-700">
          Vendor Spend:{' '}
          <span className="font-semibold text-custom-indigo">
            € {payload[0].value?.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export default function SpendByVendorChart() {
  const vendorData = useVendorSpendData()

  return (
    <Card className="rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-custom-slate-800">
          Spend by Vendor (Top 10)
        </CardTitle>
        <CardDescription className="text-xs text-custom-slate-500">
          Vendor spend with cumulative percentage distribution.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={vendorData} layout="vertical" barCategoryGap={12}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E2E8F0"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748B' }}
              width={120}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar
              dataKey="spend"
              fill="#4338CA" // Deep indigo (primary)
              background={{ fill: '#E0E7FF' }} // Light indigo track for scale
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
