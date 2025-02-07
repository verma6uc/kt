"use client"

import { Search } from 'lucide-react'

interface CompanySearchProps {
  value: string
  onChange: (value: string) => void
}

export function CompanySearch({ value, onChange }: CompanySearchProps) {
  return (
    <div className="sm:flex sm:items-center justify-end">
      <div className="relative w-72">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search companies..."
          className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}