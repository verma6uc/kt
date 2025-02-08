"use client"

import { Fragment } from 'react'
import { Building2, Users } from 'lucide-react'
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
      <svg className="ml-2 h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="ml-2 h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
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
          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
          onClick={() => onSort('created_at')}
        >
          <div className="flex items-center">
            <span>Created</span>
            <SortIcon field="created_at" />
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