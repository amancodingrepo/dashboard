'use client'

import React, { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from './button'

interface ExportButtonProps {
  exportType?: string
  label?: string
  filters?: Record<string, any>
}

export function ExportButton({
  exportType = 'invoices',
  label = 'Export CSV',
  filters = {},
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        format: 'csv',
        ...filters,
      }).toString()

      const url = `${apiUrl}/api/export/${exportType}?${queryParams}`

      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `${exportType}-export-${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => setIsExporting(false), 1000)
    } catch (error) {
      console.error('Export error:', error)
      setIsExporting(false)
      alert('Failed to export data. Please try again.')
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      className="gap-2 border-custom-slate-200 text-custom-slate-700 hover:bg-custom-slate-100 hover:text-custom-slate-900"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-custom-indigo" />
          <span className="text-sm font-medium text-custom-slate-700">
            Exporting...
          </span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4 text-custom-indigo" />
          <span className="text-sm font-medium text-custom-slate-800">
            {label}
          </span>
        </>
      )}
    </Button>
  )
}
