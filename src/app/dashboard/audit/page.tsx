"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { RecentActivityCards } from "@/components/audit/recent-activity-cards"
import { useAuditLogs } from "@/hooks/use-audit-logs"

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const {
    auditLogs,
    loading,
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'super_admin') {
    return null
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">System Activity</h1>
          <p className="mt-2 text-sm text-gray-700">
            A timeline of recent system events and user actions.
          </p>
        </div>
      </div>

      <RecentActivityCards auditLogs={auditLogs} />
    </div>
  )
}