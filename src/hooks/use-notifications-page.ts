import { useState, useCallback } from 'react'
import { Notification } from '@/types/notification'
import { useToast } from '@/components/providers/toast-provider'
import { NotificationsApi } from '@/lib/api/notifications'

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export function useNotificationsPage(initialNotifications: Notification[] = []) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])

  const { showToast } = useToast()

  const fetchNotifications = useCallback(async (
    page = pagination.currentPage,
    pageSize = pagination.pageSize,
    search = searchQuery,
    statuses = selectedStatuses,
    priorities = selectedPriorities
  ) => {
    try {
      setLoading(true)
      const response = await NotificationsApi.getNotifications({
        page,
        pageSize,
        search,
        status: statuses[0] as any,
        priority: priorities[0] as any
      })
      setNotifications(response.notifications)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch notifications'
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.pageSize, searchQuery, selectedStatuses, selectedPriorities, showToast])

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await NotificationsApi.updateNotificationStatus(id, 'read')
      
      // Refresh notifications
      fetchNotifications()

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Notification marked as read'
      })
    } catch (error) {
      console.error('Error updating notification:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update notification'
      })
    }
  }, [fetchNotifications, showToast])

  const handlePageChange = useCallback((page: number) => {
    fetchNotifications(page)
  }, [fetchNotifications])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    fetchNotifications(1, pagination.pageSize, query)
  }, [fetchNotifications, pagination.pageSize])

  const handleStatusChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses)
    fetchNotifications(1, pagination.pageSize, searchQuery, statuses, selectedPriorities)
  }, [fetchNotifications, pagination.pageSize, searchQuery, selectedPriorities])

  const handlePriorityChange = useCallback((priorities: string[]) => {
    setSelectedPriorities(priorities)
    fetchNotifications(1, pagination.pageSize, searchQuery, selectedStatuses, priorities)
  }, [fetchNotifications, pagination.pageSize, searchQuery, selectedStatuses])

  return {
    notifications,
    loading,
    pagination,
    searchQuery,
    selectedStatuses,
    selectedPriorities,
    handleMarkAsRead,
    handlePageChange,
    handleSearch,
    handleStatusChange,
    handlePriorityChange,
    fetchNotifications
  }
}