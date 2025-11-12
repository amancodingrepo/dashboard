'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { id: 'invoice', label: 'Invoice', href: '/dashboard/invoice' },
  { id: 'other-files', label: 'Other files', href: '/dashboard/other-files' },
  { id: 'departments', label: 'Departments', href: '/dashboard/departments' },
  { id: 'users', label: 'Users', href: '/dashboard/users' },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-custom-slate-200 bg-white">
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-custom-slate-200 px-4 h-16">
        <div className="flex items-center gap-3">
          <img
            src="https://logo.clearbit.com/lidl.com"
            alt="Company Logo"
            className="h-8 w-8 object-contain"
            onError={(e) => {
              e.currentTarget.src = 'https://ui-avatars.com/api/?name=Buchhaltung&size=32&background=4338CA&color=fff&bold=true'
            }}
          />
          <div>
            <div className="text-sm font-semibold text-custom-slate-800">
              Buchhaltung
            </div>
            <div className="text-xs text-custom-slate-500">12 members</div>
          </div>
        </div>
        <button
          className="p-1 text-custom-slate-400 transition-colors hover:text-custom-slate-600"
          aria-label="Workspace menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide text-custom-slate-400">
          General
        </div>
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-custom-slate-100 text-custom-indigo font-medium'
                    : 'text-custom-slate-600 hover:bg-custom-slate-100 hover:text-custom-slate-800'
                }`}
              >
                {/* Icons */}
                {item.id === 'dashboard' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                )}
                {item.id === 'invoice' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
                {item.id === 'other-files' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                )}
                {item.id === 'departments' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                )}
                {item.id === 'users' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
                {item.id === 'settings' && (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Action */}
      <div className="flex items-center gap-2 border-t border-custom-slate-200 px-4 h-16">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-custom-indigo text-white text-xs font-bold">
          F
        </div>
        <span className="text-sm font-semibold text-custom-slate-700">
          Flowbit AI
        </span>
      </div>
    </aside>
  )
}
