"use client"

import { company_type, company_status } from '@prisma/client'
import { Download, Search } from 'lucide-react'
import { Multiselect } from '@/components/ui/multiselect'
import { useToast } from '@/components/providers/toast-provider'

interface CompanyFiltersProps {
  selectedTypes: string[]
  selectedStatuses: string[]
  selectedIndustries: string[]
  searchQuery: string
  onTypeChange: (types: string[]) => void
  onStatusChange: (statuses: string[]) => void
  onIndustryChange: (industries: string[]) => void
  onSearchChange: (query: string) => void
  onExport: () => void
  industries: string[]
}

const typeOptions = Object.values(company_type).map(type => ({
  label: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase().replace('_', ' '),
  value: type
}))

const statusOptions = Object.values(company_status).map(status => ({
  label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' '),
  value: status
}))

export function CompanyFilters({
  selectedTypes,
  selectedStatuses,
  selectedIndustries,
  searchQuery,
  onTypeChange,
  onStatusChange,
  onIndustryChange,
  onSearchChange,
  onExport,
  industries
}: CompanyFiltersProps) {
  const { showToast } = useToast()

  const industryOptions = industries.map(industry => ({
    label: industry,
    value: industry
  }))

  const handleExport = () => {
    onExport()
    showToast({
      type: 'success',
      title: 'Export Started',
      message: 'Your export file will be downloaded shortly'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Export */}
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
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <Multiselect
            label="Industry"
            options={industryOptions}
            value={selectedIndustries}
            onChange={onIndustryChange}
            placeholder="Select industries"
          />
        </div>
      </div>
    </div>
  )
}