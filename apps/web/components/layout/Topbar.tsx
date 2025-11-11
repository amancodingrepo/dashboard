'use client'

import React from 'react'

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-custom-slate-200 bg-white px-6 shadow-sm">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-custom-slate-200">
          <svg
            className="h-5 w-5 text-custom-slate-600"
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
        </div>
        <h1 className="text-lg font-medium text-custom-slate-800">
          Dashboard
        </h1>
      </div>

      {/* Right: Profile Section */}
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="Amit Jadhav"
          className="h-9 w-9 rounded-full object-cover border-2 border-white"
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="36" height="36"%3E%3Crect width="36" height="36" fill="%234338CA"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="14" font-family="Inter, sans-serif"%3EAJ%3C/text%3E%3C/svg%3E'
          }}
        />
        <div className="text-right leading-tight">
          <div className="text-sm font-medium text-custom-slate-800">
            Amit Jadhav
          </div>
          <div className="text-xs text-custom-slate-500">Admin</div>
        </div>
        <button
          className="p-1 text-custom-slate-400 transition-colors hover:text-custom-slate-600"
          aria-label="More options"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
