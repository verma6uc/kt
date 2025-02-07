"use client"

import { useState, useCallback, useEffect } from 'react'
import { NotificationsApi } from '@/lib/api/notifications'
import { NotificationStatus, NotificationWithUser } from '@/types/notification'

export function useNotifications(initialStatus: NotificationStatus = 'unread') {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async (status: NotificationStatus = 'unread') => {
    try {
      setLoading(true)
      setError(null)
      const data = await NotificationsApi.getNotifications(status)
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { count } = await NotificationsApi.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }, [])

  const updateNotificationStatus = useCallback(async (
    id: number,
    status: NotificationStatus
  ) => {
    try {
      setError(null)
      const updatedNotification = await NotificationsApi.updateNotificationStatus(id.toString(), status)
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? updatedNotification : notification
        )
      )

      // Update unread count if marking as read
      if (status === 'read') {
        await fetchUnreadCount()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification')
    }
  }, [fetchUnreadCount])

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null)
      await NotificationsApi.markAllAsRead()
      await Promise.all([
        fetchNotifications('unread'),
        fetchUnreadCount()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read')
    }
  }, [fetchNotifications, fetchUnreadCount])

  // Initial fetch
  useEffect(() => {
    fetchNotifications(initialStatus)
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount, initialStatus])

  // Refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000) // every 30 seconds
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    updateNotificationStatus,
    markAllAsRead,
    fetchUnreadCount
  }
}