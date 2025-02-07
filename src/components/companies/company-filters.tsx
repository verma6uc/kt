"use client"

import { company_type, company_status } from '@prisma/client'
import { Download } from 'lucide-react'
import { Multiselect } from '@/components/ui/multiselect'
import { useToast } from '@/components/providers/toast-provider'

interface CompanyFiltersProps {
  selectedTypes: string[]
  selectedStatuses: string[]
  selectedIndustries: string[]
  onTypeChange: (types: string[]) => void
  onStatusChange: (statuses: string[]) => void
  onIndustryChange: (industries: string[]) => void
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
  onTypeChange,
  onStatusChange,
  onIndustryChange,
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
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>
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
  )
}