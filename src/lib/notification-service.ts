import { prisma } from './prisma'
import { notification_priority } from '@prisma/client'
import { NotificationStatus, NotificationWithUser } from '@/types/notification'
import crypto from 'crypto'

export class NotificationService {
  static async getNotifications(userId: string | number, companyId: string | number, status?: NotificationStatus) {
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId
    const companyIdInt = typeof companyId === 'string' ? parseInt(companyId) : companyId

    return prisma.notification.findMany({
      where: {
        user_id: userIdInt,
        company_id: companyIdInt,
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
    id: string | number,
    userId: string | number,
    companyId: string | number,
    status: NotificationStatus
  ) {
    const idInt = typeof id === 'string' ? parseInt(id) : id
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId
    const companyIdInt = typeof companyId === 'string' ? parseInt(companyId) : companyId

    return prisma.notification.update({
      where: {
        id: idInt,
        user_id: userIdInt,
        company_id: companyIdInt
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
    userId: string | number
    companyId: string | number
    title: string
    message: string
    priority: notification_priority
    link?: string
  }) {
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId
    const companyIdInt = typeof companyId === 'string' ? parseInt(companyId) : companyId

    return prisma.notification.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: userIdInt,
        company_id: companyIdInt,
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
    companyId: string | number
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
          userId: admin.id,
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

  static async markAllAsRead(userId: string | number, companyId: string | number) {
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId
    const companyIdInt = typeof companyId === 'string' ? parseInt(companyId) : companyId

    return prisma.notification.updateMany({
      where: {
        user_id: userIdInt,
        company_id: companyIdInt,
        status: 'unread'
      },
      data: {
        status: 'read',
        read_at: new Date()
      }
    })
  }

  static async getUnreadCount(userId: string | number) {
    const userIdInt = typeof userId === 'string' ? parseInt(userId) : userId

    return prisma.notification.count({
      where: {
        user_id: userIdInt,
        status: 'unread'
      }
    })
  }
}