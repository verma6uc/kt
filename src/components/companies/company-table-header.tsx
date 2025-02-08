"use client"

import { ChevronUp, ChevronDown, Users } from 'lucide-react'
import { Company } from '@/types/company'

type SortableField = keyof Company | '_count.user'

interface CompanyTableHeaderProps {
  sortField: SortableField
  sortDirection: 'asc' | 'desc'
  onSort: (field: SortableField) => void
}

export function CompanyTableHeader({ sortField, sortDirection, onSort }: CompanyTableHeaderProps) {
  const SortIcon = ({ field }: { field: SortableField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline" />
    )
  }

  return (
    <thead className="bg-gray-50">
      <tr>
        <th
          scope="col"
          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center">
            <span>Company Name</span>
            <SortIcon field="name" />
          </div>
        </th>
        <th
          scope="col"
          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
          onClick={() => onSort('industry')}
        >
          <div className="flex items-center">
            <span>Industry</span>
            <SortIcon field="industry" />
          </div>
        </th>
        <th
          scope="col"
          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
          onClick={() => onSort('type')}
        >
          <div className="flex items-center">
            <span>Type</span>
            <SortIcon field="type" />
          </div>
        </th>
        <th
          scope="col"
          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
          onClick={() => onSort('_count.user')}
        >
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-gray-400" />
            <span>Users</span>
            <SortIcon field="_count.user" />
          </div>
        </th>
        <th
          scope="col"
          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
          onClick={() => onSort('status')}
        >
          <div className="flex items-center">
            <span>Status</span>
            <SortIcon field="status" />
          </div>
        </th>
        <th
          scope="col"
          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
        >
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  )
}