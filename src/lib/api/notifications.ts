import { NotificationStatus, NotificationWithUser, NotificationPriority } from "@/types/notification"

interface NotificationsResponse {
  notifications: NotificationWithUser[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

interface NotificationsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: NotificationStatus
  priority?: NotificationPriority
}

export class NotificationsApi {
  static async getNotifications(params: NotificationsParams = {}) {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    if (params.search) searchParams.append('search', params.search)
    if (params.status) searchParams.append('status', params.status)
    if (params.priority) searchParams.append('priority', params.priority)

    const response = await fetch(
      `/api/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    return response.json() as Promise<NotificationsResponse>
  }

  static async getDropdownNotifications() {
    const response = await fetch('/api/notifications?status=unread&pageSize=5')
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    const data = await response.json() as NotificationsResponse
    return data.notifications
  }

  static async updateNotificationStatus(id: string, status: NotificationStatus) {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, status }),
    })
    if (!response.ok) {
      throw new Error('Failed to update notification')
    }
    return response.json() as Promise<NotificationWithUser>
  }

  static async deleteNotification(id: string) {
    const response = await fetch(`/api/notifications?id=${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete notification')
    }
  }

  static async markAllAsRead() {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to mark notifications as read')
    }
    return response.json() as Promise<{ count: number }>
  }

  static async getUnreadCount() {
    const response = await fetch('/api/notifications/unread-count')
    if (!response.ok) {
      throw new Error('Failed to fetch unread count')
    }
    return response.json() as Promise<{ count: number }>
  }
}