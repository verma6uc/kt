"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { NotificationsTable } from "@/components/notifications/notifications-table"
import { NotificationFilters } from "@/components/notifications/notification-filters"
import { useNotificationsPage } from "@/hooks/use-notifications-page"
import { Pagination } from "@/components/ui/pagination"

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const {
    notifications,
    loading,
    pagination,
    searchQuery,
    selectedStatuses,
    selectedPriorities,
    handleMarkAsRead,
    handleDelete,
    handlePageChange,
    handleSearch,
    handleStatusChange,
    handlePriorityChange,
    fetchNotifications
  } = useNotificationsPage()

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard/notifications')
    }
  }, [status, router])

  // Initial data fetch
  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session, fetchNotifications])

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
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all notifications including their title, message, priority, and status.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <NotificationFilters
              searchQuery={searchQuery}
              selectedStatuses={selectedStatuses}
              selectedPriorities={selectedPriorities}
              onSearchChange={handleSearch}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
            />

            <NotificationsTable
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />

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