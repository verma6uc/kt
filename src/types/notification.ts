export type NotificationStatus = 'unread' | 'read' | 'archived'
export type NotificationPriority = 'low' | 'medium' | 'high'
export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: number
  title: string
  message: string
  status: NotificationStatus
  priority: NotificationPriority
  type: NotificationType
  read: boolean
  link?: string
  created_at: string
  user_id: number
  company_id: number
  read_at: string | null
  user?: {
    id: number
    email: string
    name: string | null
  }
}

export type NotificationWithUser = Notification & {
  user: {
    id: number
    email: string
    name: string | null
  }
}