import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { cn } from '@/lib/utils' // if using shadcn/ui utils

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Flowbit - AI-Powered Invoice Management',
  description: 'Intelligent invoice processing and analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${inter.variable} font-sans`,
          'bg-custom-slate-50 text-custom-slate-800 antialiased min-h-screen flex flex-col'
        )}
      >
        {children}
      </body>
    </html>
  )
}
