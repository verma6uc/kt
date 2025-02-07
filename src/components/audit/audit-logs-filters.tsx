"use client"

import { Search } from 'lucide-react'
import { Multiselect } from '@/components/ui/multiselect'
import { audit_action } from '@prisma/client'

interface AuditLogsFiltersProps {
  searchQuery: string
  selectedActions: string[]
  startDate: string
  endDate: string
  onSearchChange: (query: string) => void
  onActionChange: (actions: string[]) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

const actionOptions = [
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
  { label: 'Login', value: 'login' },
  { label: 'Login Failed', value: 'login_failed' }
]

export function AuditLogsFilters({
  searchQuery,
  selectedActions,
  startDate,
  endDate,
  onSearchChange,
  onActionChange,
  onStartDateChange,
  onEndDateChange
}: AuditLogsFiltersProps) {
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
            placeholder="Search audit logs..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow duration-200"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Multiselect
            label="Action"
            options={actionOptions}
            value={selectedActions}
            onChange={onActionChange}
            placeholder="Select actions"
          />
          <div className="space-y-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}