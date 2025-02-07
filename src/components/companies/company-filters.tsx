"use client"

import { Search } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search companies..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow duration-200"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Multiselect
            label="Type"
            options={typeOptions}
            value={selectedTypes}
            onChange={onTypeChange}
            placeholder="Select types"
          />
          <Multiselect
            label="Status"
            options={statusOptions}
            value={selectedStatuses}
            onChange={onStatusChange}
            placeholder="Select statuses"
          />
        </div>
      </div>
    </div>
  )
}