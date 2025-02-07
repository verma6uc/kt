"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CompanyHeader } from "@/components/companies/company-header"
import { CompanySearch } from "@/components/companies/company-search"
import { CompanyTable } from "@/components/companies/company-table"
import CompanyEditModal from "@/components/companies/company-edit-modal"
import { useCompanyActions } from "@/hooks/use-company-actions"

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const {
    companies,
    selectedCompany,
    editModalOpen,
    actionMenuOpen,
    loading,
    pagination,
    sortField,
    sortDirection,
    searchQuery,
    handleAction,
    handleUpdateCompany,
    handleMenuClick,
    handleMenuToggle,
    handleModalClose,
    handlePageChange,
    handleSearch,
    handleSort,
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
              onChange={handleSearch}
            />

            <CompanyTable
              companies={companies}
              sortField={sortField}
              sortDirection={sortDirection}
              currentPage={pagination.currentPage}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              actionMenuOpen={actionMenuOpen}
              onSort={handleSort}
              onPageChange={handlePageChange}
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