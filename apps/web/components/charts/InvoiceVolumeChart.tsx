'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { invoiceTrendData } from '@/app/lib/data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-custom-slate-200 bg-white p-3 shadow-md">
        <p className="mb-2 text-sm font-medium text-custom-slate-800">
          {payload[0].payload.month}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-custom-slate-700">
            Invoice count:{' '}
            <span className="font-semibold text-custom-slate-900">
              {payload[0].value}
            </span>
          </p>
          <p className="text-xs text-custom-slate-700">
            Total Spend:{' '}
            <span className="font-semibold text-custom-indigo">
              € {payload[1]?.value?.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export default function InvoiceVolumeChart() {
  return (
    <Card className="rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-custom-slate-800">
          Invoice Volume + Value Trend
        </CardTitle>
        <CardDescription className="text-xs text-custom-slate-500">
          Invoice count and total spend over 12 months.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={invoiceTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0' }} />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: '#64748B',
                paddingTop: 12,
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="invoiceCount"
              stroke="#A78BFA" // light purple
              strokeWidth={3}
              dot={false}
              name="Invoice Count"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalSpend"
              stroke="#4338CA" // deep indigo
              strokeWidth={3}
              dot={false}
              name="Total Spend (€)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
