"use client"

import { CompanyTableActions } from "./company-table-actions"
import CompanyFilters from "./company-filters"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Building2 } from "lucide-react"
import clsx from "clsx"
import { useState, useMemo, useEffect } from "react"

interface Company {
  id: number
  name: string
  identifier: string
  type: 'small_business' | 'enterprise' | 'startup'
  status: 'pending_setup' | 'active' | 'suspended' | 'inactive'
  industry: string | null
  created_at: Date
  _count: {
    users: number
  }
}

type SortableField = keyof Omit<Company, '_count'> | 'users'

interface CompaniesTableProps {
  companies: Company[]
}

const TYPE_LABELS = {
  small_business: 'Small Business',
  enterprise: 'Enterprise',
  startup: 'Startup'
}

const ITEMS_PER_PAGE = 10

export default function CompaniesTable({ companies: initialCompanies }: CompaniesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortableField>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortableField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    )
  }

  const filteredAndSortedCompanies = useMemo(() => {
    return [...initialCompanies]
      .filter(company => {
        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase()
          const matchesName = company.name.toLowerCase().includes(searchLower)
          const matchesIdentifier = company.identifier.toLowerCase().includes(searchLower)
          const matchesIndustry = company.industry?.toLowerCase().includes(searchLower)
          if (!matchesName && !matchesIdentifier && !matchesIndustry) {
            return false
          }
        }

        // Apply status filter
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(company.status)) {
          return false
        }

        // Apply type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(company.type)) {
          return false
        }

        // Apply industry filter
        if (selectedIndustries.length > 0 && !selectedIndustries.includes(company.industry || '')) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        let aValue: any = sortField === 'users' ? a._count.users : a[sortField]
        let bValue: any = sortField === 'users' ? b._count.users : b[sortField]

        if (aValue === null) aValue = ''
        if (bValue === null) bValue = ''

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
  }, [initialCompanies, searchQuery, selectedStatuses, selectedTypes, selectedIndustries, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedCompanies.length / ITEMS_PER_PAGE)
  const paginatedCompanies = filteredAndSortedCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatuses, selectedTypes, selectedIndustries])

  return (
    <div className="mt-8 flex flex-col">
      <div className="mb-4">
        <CompanyFilters
          onSearchChange={setSearchQuery}
          onStatusChange={setSelectedStatuses}
          onTypeChange={setSelectedTypes}
          onIndustryChange={setSelectedIndustries}
        />
      </div>

      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-gray-900 sm:pl-6 cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-gray-900 cursor-pointer select-none"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      <SortIcon field="type" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-gray-900 cursor-pointer select-none"
                    onClick={() => handleSort('industry')}
                  >
                    <div className="flex items-center">
                      Industry
                      <SortIcon field="industry" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-gray-900 cursor-pointer select-none"
                    onClick={() => handleSort('users')}
                  >
                    <div className="flex items-center">
                      Users
                      <SortIcon field="users" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-gray-900 cursor-pointer select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-medium text-gray-900 cursor-pointer select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Created At
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
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedCompanies.map((company) => (
                  <tr 
                    key={company.id}
                    className="hover:bg-gray-50/50 transition-colors duration-150 ease-in-out"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-gray-500">{company.identifier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {TYPE_LABELS[company.type]}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {company.industry || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center">
                        <div className="h-6 w-6 flex-shrink-0 rounded bg-blue-50 flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-700">{company._count.users}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          {
                            'bg-green-50 text-green-700': company.status === 'active',
                            'bg-yellow-50 text-yellow-700': company.status === 'pending_setup',
                            'bg-red-50 text-red-700': company.status === 'suspended',
                            'bg-gray-50 text-gray-700': company.status === 'inactive'
                          }
                        )}
                      >
                        {company.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <CompanyTableActions company={company} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset ring-gray-300"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset ring-gray-300"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedCompanies.length)}
              </span>{' '}
              of <span className="font-medium">{filteredAndSortedCompanies.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
                    page === currentPage
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}