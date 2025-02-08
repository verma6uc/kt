"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Activity, AlertTriangle, UserPlus, FileText } from "lucide-react"
import { HealthStatusDashboard } from "@/components/companies/metrics/health-status-dashboard"
import { RecentActivityCards } from "@/components/audit/recent-activity-cards"
import AdminInvitationModal from "@/components/companies/admin-invitation-modal"
import InvitationActions from "@/components/companies/invitation-actions"
import InvitationDropdown from "@/components/companies/invitation-dropdown"
import SectionTabs from "@/components/ui/section-tabs"
import type { MetricsResponse } from "@/types/metrics"
import type { AuditLog } from "@/types/audit"
import { invitation_status } from "@prisma/client"

interface AdminInvitation {
  id: number
  email: string
  status: invitation_status
  created_at: Date
  expires_at: Date
  accepted_at?: Date | null
  cancelled_at?: Date | null
  reminder_sent_at?: Date | null
  reminder_count?: number
}

export default function CompanyDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'invitations' | 'health' | 'audit'>('invitations')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Super admin check
  useEffect(() => {
    if (session?.user && session.user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch metrics
        const metricsResponse = await fetch(`/api/companies/${params.id}/metrics`)
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch company metrics')
        }
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)

        // Fetch admin invitations
        const invitationsResponse = await fetch(`/api/companies/${params.id}/admin-invitation`)
        if (!invitationsResponse.ok) {
          throw new Error('Failed to fetch admin invitations')
        }
        const invitationsData = await invitationsResponse.json()
        setInvitations(invitationsData.invitations)

        // Fetch audit logs
        const auditResponse = await fetch(`/api/audit/logs?companyId=${params.id}`)
        if (!auditResponse.ok) {
          throw new Error('Failed to fetch audit logs')
        }
        const auditData = await auditResponse.json()
        setAuditLogs(auditData.logs)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user && session.user.role === 'super_admin' && params.id) {
      fetchData()
    }
  }, [session, params.id])

  const handleInvitationSuccess = () => {
    // Refetch invitations after successful invitation
    fetch(`/api/companies/${params.id}/admin-invitation`)
      .then(res => res.json())
      .then(data => setInvitations(data.invitations))
      .catch(err => console.error('Error refreshing invitations:', err))
  }

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

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const sections = [
    { id: 'invitations', name: 'Admin Invitations', icon: UserPlus },
    { id: 'health', name: 'Health Check', icon: Activity },
    { id: 'audit', name: 'Recent Activity', icon: FileText },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{metrics.company.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Company ID: {metrics.company.identifier}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SectionTabs
          tabs={sections}
          activeTab={activeTab}
          onChange={(tabId) => setActiveTab(tabId as any)}
        />

        <div className="bg-white shadow-sm rounded-b-lg">
          {activeTab === 'invitations' && (
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                  Invite Admin
                </button>
              </div>
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full table-fixed divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="w-[40%] py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8">Email</th>
                          <th scope="col" className="w-[15%] px-3 py-2 text-left text-sm font-semibold text-gray-900">Created</th>
                          <th scope="col" className="w-[35%] px-3 py-2 text-left text-sm font-semibold text-gray-900">Status & Details</th>
                          <th scope="col" className="w-[10%] relative py-2 pl-3 pr-4 sm:pr-6 lg:pr-8">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {invitations.map((invitation) => (
                          <tr key={invitation.id} className="hover:bg-gray-50">
                            <td className="w-[40%] py-2 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">{invitation.email}</td>
                            <td className="w-[15%] px-3 py-2 text-sm text-gray-500">
                              {new Date(invitation.created_at).toLocaleDateString()}
                            </td>
                            <td className="w-[35%] px-3 py-2 text-sm">
                              <InvitationActions invitation={invitation} />
                            </td>
                            <td className="w-[10%] relative py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                              <InvitationDropdown
                                invitation={invitation}
                                companyId={parseInt(params.id as string)}
                                onSuccess={handleInvitationSuccess}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="p-6">
              <HealthStatusDashboard metrics={metrics.metrics.health} />
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="p-6">
              <RecentActivityCards auditLogs={auditLogs} />
            </div>
          )}
        </div>
      </div>

      <AdminInvitationModal
        companyId={parseInt(params.id as string)}
        companyName={metrics.company.name}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  )
}