"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CompanyTable } from "@/components/companies/company-table"
import { CompanyFilters } from "@/components/companies/company-filters"
import { CompanyCreateModal } from "@/components/companies/company-create-modal"
import { CompanyEditModal } from "@/components/companies/company-edit-modal"
import { Company } from "@/types/company"
import { useToast } from "@/components/providers/toast-provider"
import { Pagination } from "@/components/ui/pagination"

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { showToast } = useToast()
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Add basic params
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())
      params.append('search', searchQuery)

      // Add array params
      selectedTypes.forEach(type => params.append('types[]', type))
      selectedStatuses.forEach(status => params.append('statuses[]', status))

      const response = await fetch(`/api/companies?${params}`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      
      const data = await response.json()
      setCompanies(data.companies)
      setTotalPages(data.pagination.totalPages)
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

  useEffect(() => {
    if (session?.user) {
      fetchCompanies()
    }
  }, [session, currentPage, pageSize, searchQuery, selectedTypes, selectedStatuses])

  const handleCreateCompany = async () => {
    setCreateModalOpen(false)
    await fetchCompanies()
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Company created successfully'
    })
  }

  const handleEditCompany = async () => {
    setEditModalOpen(false)
    setSelectedCompany(null)
    await fetchCompanies()
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Company updated successfully'
    })
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setEditModalOpen(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all companies including their name, status, and other details.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              Add Company
            </button>
          </div>
        </div>

        <div className="mt-8">
          <CompanyFilters
            searchQuery={searchQuery}
            selectedTypes={selectedTypes}
            selectedStatuses={selectedStatuses}
            onSearchChange={setSearchQuery}
            onTypeChange={setSelectedTypes}
            onStatusChange={setSelectedStatuses}
          />

          <CompanyTable
            companies={companies}
            onEdit={handleEdit}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {createModalOpen && (
        <CompanyCreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleCreateCompany}
        />
      )}

      {editModalOpen && selectedCompany && (
        <CompanyEditModal
          isOpen={editModalOpen}
          company={selectedCompany}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedCompany(null)
          }}
          onSuccess={handleEditCompany}
        />
      )}
    </div>
  )
}