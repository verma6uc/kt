"use client"

import { Search } from 'lucide-react'
import { Multiselect } from '@/components/ui/multiselect'
import { notification_priority, notification_status } from '@prisma/client'

interface NotificationFiltersProps {
  searchQuery: string
  selectedStatuses: string[]
  selectedPriorities: string[]
  onSearchChange: (query: string) => void
  onStatusChange: (statuses: string[]) => void
  onPriorityChange: (priorities: string[]) => void
}

const statusOptions = [
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' },
  { label: 'Archived', value: 'archived' }
]

const priorityOptions = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' }
]

export function NotificationFilters({
  searchQuery,
  selectedStatuses,
  selectedPriorities,
  onSearchChange,
  onStatusChange,
  onPriorityChange
}: NotificationFiltersProps) {
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
            placeholder="Search notifications..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white/50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-shadow duration-200"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm shadow-sm rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Multiselect
            label="Status"
            options={statusOptions}
            value={selectedStatuses}
            onChange={onStatusChange}
            placeholder="Select statuses"
          />
          <Multiselect
            label="Priority"
            options={priorityOptions}
            value={selectedPriorities}
            onChange={onPriorityChange}
            placeholder="Select priorities"
          />
        </div>
      </div>
    </div>
  )
}