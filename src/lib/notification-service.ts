import { prisma } from './prisma'
import { notification_priority } from '@prisma/client'
import { NotificationStatus, NotificationWithUser } from '@/types/notification'

export class NotificationService {
  static async getNotifications(userId: string, companyId: string, status?: NotificationStatus) {
    return prisma.notification.findMany({
      where: {
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        status: status || 'unread'
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  static async updateNotificationStatus(
    id: string,
    userId: string,
    companyId: string,
    status: NotificationStatus
  ) {
    return prisma.notification.update({
      where: {
        id: parseInt(id),
        user_id: parseInt(userId),
        company_id: parseInt(companyId)
      },
      data: {
        status,
        read_at: status === 'read' ? new Date() : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  static transformNotification(notification: NotificationWithUser) {
    return {
      ...notification,
      id: notification.id.toString(),
      user_id: notification.user_id.toString(),
      company_id: notification.company_id.toString(),
      user: notification.user ? {
        ...notification.user,
        id: notification.user.id.toString()
      } : null
    }
  }

  static async createNotification({
    userId,
    companyId,
    title,
    message,
    priority,
    link
  }: {
    userId: string
    companyId: string
    title: string
    message: string
    priority: notification_priority
    link?: string
  }) {
    return prisma.notification.create({
      data: {
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        title,
        message,
        priority,
        link: link || null,
        status: 'unread'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  }

  static async notifySuperAdmins({
    companyId,
    title,
    message,
    priority,
    link
  }: {
    companyId: string
    title: string
    message: string
    priority: notification_priority
    link?: string
  }) {
    // Get all super admins
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'super_admin',
        status: 'active'
      },
      select: {
        id: true
      }
    })

    // Create notifications for each super admin
    const notifications = await Promise.all(
      superAdmins.map(admin =>
        this.createNotification({
          userId: admin.id.toString(),
          companyId,
          title,
          message,
          priority,
          link
        })
      )
    )

    return notifications
  }

  static async markAllAsRead(userId: string, companyId: string) {
    return prisma.notification.updateMany({
      where: {
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        status: 'unread'
      },
      data: {
        status: 'read',
        read_at: new Date()
      }
    })
  }

  static async getUnreadCount(userId: string, companyId: string) {
    return prisma.notification.count({
      where: {
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        status: 'unread'
      }
    })
  }
}