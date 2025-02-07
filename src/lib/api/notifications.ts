import { NotificationStatus, NotificationWithUser } from "@/types/notification"

export class NotificationsApi {
  static async getNotifications(status?: NotificationStatus) {
    const response = await fetch(
      `/api/notifications${status ? `?status=${status}` : ''}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch notifications')
    }
    return response.json() as Promise<NotificationWithUser[]>
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