"use client"

import { useState } from 'react'
import { Company } from '@/types/company'
import { CompanyTableRow } from './company-table-row'
import { CompanyTableHeader } from './company-table-header'

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
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}
              </span>{' '}
              of <span className="font-medium">{pagination.totalCount}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}