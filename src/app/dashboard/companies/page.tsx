"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { Company } from "@/types/company"
import { CompanyHeader } from "@/components/companies/company-header"
import { CompanySearch } from "@/components/companies/company-search"
import { CompanyTable } from "@/components/companies/company-table"
import CompanyEditModal from "@/components/companies/company-edit-modal"
import { useCompanyActions } from "@/hooks/use-company-actions"

const ITEMS_PER_PAGE = 10

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Company | 'users'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const {
    companies,
    selectedCompany,
    editModalOpen,
    actionMenuOpen,
    loading,
    handleAction,
    handleUpdateCompany,
    handleMenuClick,
    handleMenuToggle,
    handleModalClose,
    fetchCompanies
  } = useCompanyActions()

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/companies')
    } else if (session?.user?.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.role === 'super_admin') {
      fetchCompanies()
    }
  }, [session, fetchCompanies])

  // Handle sorting
  const handleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Filter and sort companies
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
        if (sortField === 'users') {
          return sortDirection === 'asc' 
            ? a._count.users - b._count.users
            : b._count.users - a._count.users
        }

        const aValue = a[sortField as keyof Company]
        const bValue = b[sortField as keyof Company]

        // Handle undefined or null values
        if (!aValue && !bValue) return 0
        if (!aValue) return sortDirection === 'asc' ? -1 : 1
        if (!bValue) return sortDirection === 'asc' ? 1 : -1

        // Convert dates to timestamps for comparison
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
        }
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
  }, [companies, searchQuery, sortField, sortDirection])

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
        <CompanyHeader />

        <div className="bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <CompanySearch
              value={searchQuery}
              onChange={setSearchQuery}
            />

            <CompanyTable
              companies={filteredAndSortedCompanies}
              sortField={sortField}
              sortDirection={sortDirection}
              currentPage={currentPage}
              pageSize={ITEMS_PER_PAGE}
              actionMenuOpen={actionMenuOpen}
              onSort={handleSort}
              onPageChange={setCurrentPage}
              onAction={handleAction}
              onMenuToggle={handleMenuToggle}
              onMenuClick={handleMenuClick}
            />
          </div>
        </div>
      </div>

      {selectedCompany && (
        <CompanyEditModal
          company={selectedCompany}
          isOpen={editModalOpen}
          onClose={handleModalClose}
          onUpdate={handleUpdateCompany}
        />
      )}
    </div>
  )
}