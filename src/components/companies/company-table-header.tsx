"use client"

import { ChevronUp, ChevronDown, Users, User } from 'lucide-react'
import { Company } from '@/types/company'

interface CompanyTableHeaderProps {
  sortField: keyof Company | 'users'
  sortDirection: 'asc' | 'desc'
  onSort: (field: keyof Company) => void
}

export function CompanyTableHeader({ sortField, sortDirection, onSort }: CompanyTableHeaderProps) {
  const SortIcon = ({ field }: { field: keyof Company | 'users' }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline" />
    )
  }

  return (
    <thead>
      <tr>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center">
            <span className="font-bold">Company Name</span>
            <SortIcon field="name" />
          </div>
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
          onClick={() => onSort('type')}
        >
          <div className="flex items-center">
            <span className="font-bold">Type</span>
            <SortIcon field="type" />
          </div>
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
          onClick={() => onSort('status')}
        >
          <div className="flex items-center">
            <span className="font-bold">Status</span>
            <SortIcon field="status" />
          </div>
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
          onClick={() => onSort('industry')}
        >
          <div className="flex items-center">
            <span className="font-bold">Industry</span>
            <SortIcon field="industry" />
          </div>
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
          onClick={() => onSort('users')}
        >
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-blue-500" />
            <span className="font-bold">Users</span>
            <SortIcon field="users" />
          </div>
        </th>
        <th
          scope="col"
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1 text-blue-500" />
            <span className="font-bold">Admin</span>
          </div>
        </th>
        <th
          scope="col"
          className="relative px-6 py-3"
        >
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  )
}