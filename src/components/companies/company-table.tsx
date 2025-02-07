"use client"

import { Company } from '@/types/company'
import { CompanyTableHeader } from './company-table-header'
import { CompanyTableRow } from './company-table-row'
import { CompanyPagination } from './company-pagination'

interface CompanyTableProps {
  companies: Company[]
  sortField: keyof Company | 'users'
  sortDirection: 'asc' | 'desc'
  currentPage: number
  pageSize: number
  actionMenuOpen: number | null
  onSort: (field: keyof Company) => void
  onPageChange: (page: number) => void
  onAction: (company: Company, action: 'edit' | 'suspend' | 'archive') => void
  onMenuToggle: (companyId: number) => void
  onMenuClick: (e: React.MouseEvent) => void
}

export function CompanyTable({
  companies,
  sortField,
  sortDirection,
  currentPage,
  pageSize,
  actionMenuOpen,
  onSort,
  onPageChange,
  onAction,
  onMenuToggle,
  onMenuClick
}: CompanyTableProps) {
  const totalItems = companies.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedCompanies = companies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="mt-4 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <CompanyTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            />
            <tbody className="divide-y divide-gray-200">
              {paginatedCompanies.map((company) => (
                <CompanyTableRow
                  key={company.id}
                  company={company}
                  actionMenuOpen={actionMenuOpen === company.id}
                  onActionMenuToggle={() => onMenuToggle(company.id)}
                  onAction={(action) => onAction(company, action)}
                  onMenuClick={onMenuClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CompanyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  )
}