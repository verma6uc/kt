"use client"

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CompanyPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function CompanyPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: CompanyPaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {(currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          of <span className="font-medium">{totalItems}</span> results
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}