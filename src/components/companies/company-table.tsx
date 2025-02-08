"use client"

import { useState } from 'react'
import { Company } from '@/types/company'
import { CompanyTableRow } from './company-table-row'
import { CompanyTableHeader } from './company-table-header'
import { Pagination } from '@/components/ui/pagination'

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type SortableField = keyof Company | '_count.user'

interface CompanyTableProps {
  companies: Company[]
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onStatusChange: () => void
  onEdit: (company: Company) => void
  onSort?: (field: SortableField, direction: 'asc' | 'desc') => void
  sortField?: SortableField
  sortDirection?: 'asc' | 'desc'
}

export function CompanyTable({ 
  companies, 
  pagination, 
  onPageChange, 
  onStatusChange,
  onEdit,
  onSort,
  sortField = 'name',
  sortDirection = 'asc'
}: CompanyTableProps) {
  const [currentSortField, setCurrentSortField] = useState<SortableField>(sortField)
  const [currentSortDirection, setCurrentSortDirection] = useState<'asc' | 'desc'>(sortDirection)

  const handleSort = (field: SortableField) => {
    const newDirection = field === currentSortField && currentSortDirection === 'asc' ? 'desc' : 'asc'
    setCurrentSortField(field)
    setCurrentSortDirection(newDirection)
    onSort?.(field, newDirection)
  }

  if (!companies.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No companies found</p>
      </div>
    )
  }

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <CompanyTableHeader
                sortField={currentSortField}
                sortDirection={currentSortDirection}
                onSort={handleSort}
              />
              <tbody className="divide-y divide-gray-200 bg-white">
                {companies.map((company) => (
                  <CompanyTableRow
                    key={company.id}
                    company={company}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-700 mb-4">
            Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalCount}</span> results
          </p>
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}