'use client'

import StatCard from '@/components/dashboard/StatCard'
import InvoiceVolumeChart from '@/components/charts/InvoiceVolumeChart'
import SpendByVendorChart from '@/components/charts/SpendByVendorChart'
import SpendByCategoryChart from '@/components/charts/SpendByCategoryChart'
import CashOutflowChart from '@/components/charts/CashOutflowChart'
import InvoicesByVendorTable from '@/components/dashboard/InvoicesByVendorTable'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useStatsData } from '@/app/lib/data'

export default function DashboardPage() {
  const statsData = useStatsData()
  return (
    <div className="p-6 bg-custom-slate-50">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-4 gap-6">
        {/* Stats Row - 4 columns */}
        {statsData.map((stat, index) => (
          <div key={index}>
            <StatCard {...stat} />
          </div>
        ))}
        
        {/* Invoice Trend Chart - spans 2 columns */}
        <div className="col-span-2">
          <InvoiceVolumeChart />
        </div>
        
        {/* Spend by Vendor Chart - spans 2 columns */}
        <div className="col-span-2">
          <SpendByVendorChart />
        </div>
        
        {/* Spend by Category - 1 column + 1/3 */}
        <div>
          <SpendByCategoryChart />
        </div>
        
        {/* Cash Outflow - 1 column + 1/3 */}
        <div>
          <CashOutflowChart />
        </div>
        
        {/* Invoices Table - spans 2 columns */}
        <div className="col-span-2">
          <InvoicesByVendorTable />
        </div>

        {/* Chat Interface - full width */}
        <div className="col-span-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}
