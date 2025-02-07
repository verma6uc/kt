"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import clsx from "clsx"
import { Company } from "@/types/company"

const ITEMS_PER_PAGE = 10

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Company>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [companies, setCompanies] = useState<Company[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/companies')
    } else if (session?.user?.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) throw new Error('Failed to fetch companies')
        const data = await response.json()
        setCompanies(data)
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'super_admin') {
      fetchData()
    }
  }, [session])

  const filteredAndSortedCompanies = useMemo(() => {
    return [...companies]
      .filter(company => {
        if (!searchQuery) return true
        
        const searchLower = searchQuery.toLowerCase()
        return (
          company.name.toLowerCase().includes(searchLower) ||
          company.identifier.toLowerCase().includes(searchLower) ||
          (company.industry?.toLowerCase().includes(searchLower))
        )
      })
      .sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue === null) return sortDirection === 'asc' ? -1 : 1
        if (bValue === null) return sortDirection === 'asc' ? 1 : -1

        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
  }, [companies, searchQuery, sortField, sortDirection])

  const totalPages = Math.ceil(filteredAndSortedCompanies.length / ITEMS_PER_PAGE)
  const paginatedCompanies = filteredAndSortedCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: keyof Company }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1 inline" />
    )
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'super_admin') {
    return null
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all companies in the system
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center justify-end">
              <div className="relative w-72">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search companies..."
                  className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            <SortIcon field="name" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('type')}
                        >
                          <div className="flex items-center">
                            Type
                            <SortIcon field="type" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            <SortIcon field="status" />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('industry')}
                        >
                          <div className="flex items-center">
                            Industry
                            <SortIcon field="industry" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedCompanies.map((company) => (
                        <tr key={company.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {company.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                {
                                  'bg-green-100 text-green-800': company.status === 'active',
                                  'bg-yellow-100 text-yellow-800': company.status === 'pending_setup',
                                  'bg-red-100 text-red-800': company.status === 'suspended',
                                  'bg-gray-100 text-gray-800': company.status === 'inactive',
                                }
                              )}
                            >
                              {company.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {company.industry || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}