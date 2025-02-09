"use client"

import { CompanyTable } from "@/components/companies/company-table"
import { CompanyFilters } from "@/components/companies/company-filters"
import { CompanyCreateModal } from "@/components/companies/company-create-modal"
import { CompanyEditModal } from "@/components/companies/company-edit-modal"
import { useState, useEffect } from "react"
import { Company } from "@/types/company"
import { useToast } from "@/components/providers/toast-provider"
import { Download, Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type SortableField = keyof Company | '_count.user'

export default function CompaniesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()

  // State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortableField>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Fetch companies with filters, sorting, and pagination
  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Add basic params
      params.set('page', pagination.currentPage.toString())
      params.set('pageSize', pagination.pageSize.toString())
      
      // Handle special case for user count sorting
      if (sortField === '_count.user') {
        params.set('sortField', '_count.user')
      } else {
        params.set('sortField', sortField)
      }
      params.set('sortDirection', sortDirection)
      
      // Add search if present
      if (searchQuery) {
        params.set('search', searchQuery)
      }
      
      // Add array params
      selectedTypes.forEach(type => params.append('types[]', type))
      selectedStatuses.forEach(status => params.append('statuses[]', status))

      const response = await fetch(`/api/companies?${params}`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      const data = await response.json()
      
      setCompanies(data.companies)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching companies:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch companies'
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and refetch on filter/page/sort changes
  useEffect(() => {
    fetchCompanies()
  }, [pagination.currentPage, searchQuery, selectedTypes, selectedStatuses, sortField, sortDirection])

  // Handle search and filter changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleTypeChange = (types: string[]) => {
    setSelectedTypes(types)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  // Handle sorting
  const handleSort = (field: SortableField, direction: 'asc' | 'desc') => {
    setSortField(field)
    setSortDirection(direction)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Handle company creation success
  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    fetchCompanies()
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Company created successfully'
    })
  }

  // Handle company edit
  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setShowEditModal(true)
  }

  // Handle company edit success
  const handleEditSuccess = () => {
    setShowEditModal(false)
    setSelectedCompany(null)
    fetchCompanies()
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Company updated successfully'
    })
  }

  // Handle company status change
  const handleStatusUpdate = () => {
    fetchCompanies()
  }

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch('/api/companies/export')
      if (!response.ok) throw new Error('Failed to export companies')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `companies-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Companies exported successfully'
      })
    } catch (error) {
      console.error('Error exporting companies:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to export companies'
      })
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor all registered companies
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Company
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <CompanyFilters
            searchQuery={searchQuery}
            selectedTypes={selectedTypes}
            selectedStatuses={selectedStatuses}
            onSearchChange={handleSearchChange}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CompanyTable
              companies={companies}
              pagination={pagination}
              onPageChange={handlePageChange}
              onStatusChange={handleStatusUpdate}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>

      {showCreateModal && (
        <CompanyCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedCompany && (
        <CompanyEditModal
          isOpen={showEditModal}
          company={selectedCompany}
          onClose={() => {
            setShowEditModal(false)
            setSelectedCompany(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}