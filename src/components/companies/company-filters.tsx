"use client"

import { Search, X } from 'lucide-react'
import { Multiselect } from '@/components/ui/multiselect'

interface CompanyFiltersProps {
  searchQuery: string
  selectedTypes: string[]
  selectedStatuses: string[]
  onSearchChange: (query: string) => void
  onTypeChange: (types: string[]) => void
  onStatusChange: (statuses: string[]) => void
}

const typeOptions = [
  { label: 'Enterprise', value: 'enterprise' },
  { label: 'Small Business', value: 'small_business' },
  { label: 'Startup', value: 'startup' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending Setup', value: 'pending_setup' }
]

export function CompanyFilters({
  searchQuery,
  selectedTypes,
  selectedStatuses,
  onSearchChange,
  onTypeChange,
  onStatusChange
}: CompanyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-blue-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search companies..."
          className="block w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 flex-1 sm:justify-end">
        <div className="w-full sm:w-[180px]">
          <Multiselect
            label="Type"
            options={typeOptions}
            value={selectedTypes}
            onChange={onTypeChange}
            placeholder="All types"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Multiselect
            label="Status"
            options={statusOptions}
            value={selectedStatuses}
            onChange={onStatusChange}
            placeholder="All statuses"
          />
        </div>
      </div>
    </div>
  )
}