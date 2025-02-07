"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AuditLogsTable } from "@/components/audit/audit-logs-table"
import { AuditLogsFilters } from "@/components/audit/audit-logs-filters"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import { Pagination } from "@/components/ui/pagination"

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const {
    auditLogs,
    loading,
    pagination,
    searchQuery,
    selectedActions,
    startDate,
    endDate,
    handlePageChange,
    handleSearch,
    handleActionChange,
    handleStartDateChange,
    handleEndDateChange,
    fetchAuditLogs
  } = useAuditLogs()

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/audit')
    }
  }, [status, router])

  // Super admin check
  useEffect(() => {
    if (session?.user && session.user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Initial data fetch
  useEffect(() => {
    if (session?.user && session.user.role === 'super_admin') {
      fetchAuditLogs()
    }
  }, [session, fetchAuditLogs])

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
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
            <p className="mt-2 text-sm text-gray-700">
              A detailed history of all system actions including user logins, company changes, and more.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <AuditLogsFilters
              searchQuery={searchQuery}
              selectedActions={selectedActions}
              startDate={startDate}
              endDate={endDate}
              onSearchChange={handleSearch}
              onActionChange={handleActionChange}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
            />

            <AuditLogsTable auditLogs={auditLogs} />

            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}