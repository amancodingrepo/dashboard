'use client'

import React from 'react'
import { useInvoicesData } from '@/app/lib/data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

export default function InvoicesByVendorTable() {
  const invoicesData = useInvoicesData()

  return (
    <Card className="rounded-xl border border-custom-slate-200 bg-white shadow-sm transition-base">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-custom-slate-800">
          Invoices by Vendor
        </CardTitle>
        <CardDescription className="text-xs text-custom-slate-500">
          Top vendors by invoice count and net value.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-custom-slate-50 text-xs uppercase text-custom-slate-500">
                <th className="px-6 py-3 text-left font-medium">Vendor</th>
                <th className="px-6 py-3 text-center font-medium"># Invoices</th>
                <th className="px-6 py-3 text-right font-medium">Net Value (€)</th>
              </tr>
            </thead>

            <tbody>
              {invoicesData.map((row, index) => {
                // Generate vendor logo URL based on vendor name
                const vendorDomain = row.vendor.toLowerCase().replace(/\s+/g, '').replace(/gmbh|inc|ltd|llc/gi, '') + '.com'
                const logoUrl = `https://logo.clearbit.com/${vendorDomain}`
                const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.vendor)}&size=32&background=4338CA&color=fff&bold=true`
                
                return (
                  <tr
                    key={index}
                    className="border-b border-custom-slate-100 hover:bg-custom-slate-50 transition-base"
                  >
                    <td className="px-6 py-3 text-sm text-custom-slate-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={logoUrl}
                          alt={row.vendor}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = fallbackUrl
                          }}
                        />
                        <span className="font-medium">{row.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-custom-slate-700">
                      {row.invoiceCount}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-custom-slate-800">
                      € {row.netValue.toLocaleString('de-DE')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
