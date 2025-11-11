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

interface OutflowData {
  range: string
  amount: number
}

const outflowData: OutflowData[] = [
  { range: '0–7 days', amount: 48000 },
  { range: '8–30 days', amount: 60000 },
  { range: '31–60 days', amount: 55000 },
  { range: '60+ days', amount: 85000 },
]

const formatYAxis = (value: number) => `€${(value / 1000).toFixed(0)}k`

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-custom-slate-200 bg-white p-3 shadow-md">
        <p className="mb-1 text-sm font-medium text-custom-slate-800">
          {payload[0].payload.range}
        </p>
        <p className="text-xs font-medium text-custom-indigo">
          Amount:{' '}
          <span className="font-semibold">
            €{payload[0].value?.toLocaleString('de-DE')}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export default function CashOutflowChart() {
  return (
    <Card className="rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-custom-slate-800">
          Cash Outflow Forecast
        </CardTitle>
        <CardDescription className="text-xs text-custom-slate-500">
          Expected payment obligations grouped by due date ranges.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={outflowData} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: '#dae0e9ff' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar
              dataKey="amount"
              fill="#4338CA" // Primary Indigo
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
