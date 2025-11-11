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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface CategoryData {
  name: string
  value: number
  color: string
}

const categoryData: CategoryData[] = [
  { name: 'Operations', value: 1000, color: '#4338CA' }, // primary indigo
  { name: 'Marketing', value: 7250, color: '#F59E0B' }, // orange
  { name: 'Facilities', value: 1000, color: '#10B981' }, // green
]

interface CustomLegendProps {
  payload?: any[]
}

const CustomLegend = ({ payload }: CustomLegendProps) => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {payload?.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-custom-slate-600">
              {categoryData[index].name}
            </span>
          </div>
          <span className="font-medium text-custom-slate-800">
            € {categoryData[index].value.toLocaleString('de-DE')}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SpendByCategoryChart() {
  return (
    <Card className="rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-custom-slate-800">
          Spend by Category
        </CardTitle>
        <CardDescription className="text-xs text-custom-slate-500">
          Distribution of spending across different categories.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              cornerRadius={4}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `€ ${value.toLocaleString('de-DE')}`}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
              labelStyle={{
                fontSize: '12px',
                color: '#1E293B',
                fontWeight: 500,
              }}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
