import { prisma } from './prisma'
import nodemailer from 'nodemailer'

export class EmailService {
  private static async getCompanyEmailConfig(companyId: string) {
    const config = await prisma.company_config.findUnique({
      where: { company_id: companyId }
    })

    if (!config?.smtp_host || !config?.smtp_port || !config?.smtp_user || !config?.smtp_password) {
      throw new Error('Email configuration not found')
    }

    return {
      host: config.smtp_host,
      port: config.smtp_port,
      user: config.smtp_user,
      password: config.smtp_password,
      fromEmail: config.smtp_from_email || config.smtp_user,
      fromName: config.smtp_from_name || 'System Notification'
    }
  }

  private static async createTransport(companyId: string) {
    const config = await this.getCompanyEmailConfig(companyId)
    
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.password
      }
    })
  }

  static async sendPasswordExpiryNotification(
    userId: string,
    daysUntilExpiry: number
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: { config: true }
        }
      }
    })

    if (!user || !user.company.config) return

    // Check if email notifications are enabled
    const notifPref = user.company.config.notification_preference
    if (notifPref !== 'email' && notifPref !== 'both') return

    try {
      const config = await this.getCompanyEmailConfig(user.company_id)
      const transport = await this.createTransport(user.company_id)

      await transport.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: user.email,
        subject: `Password Expiry Notice - ${daysUntilExpiry} days remaining`,
        html: `
          <h1>Password Expiry Notice</h1>
          <p>Dear ${user.name || user.email},</p>
          <p>Your password will expire in ${daysUntilExpiry} days. Please change your password to maintain access to your account.</p>
          <p>If you do not change your password before it expires, you will be required to change it at your next login.</p>
          <br>
          <p>Best regards,<br>${config.fromName}</p>
        `
      })
    } catch (error) {
      console.error('Failed to send password expiry notification:', error)
    }
  }

  static async sendAccountLockedNotification(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          include: { config: true }
        }
      }
    })

    if (!user || !user.company.config) return

    // Check if email notifications are enabled
    const notifPref = user.company.config.notification_preference
    if (notifPref !== 'email' && notifPref !== 'both') return

    try {
      const config = await this.getCompanyEmailConfig(user.company_id)
      const transport = await this.createTransport(user.company_id)

      await transport.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: user.email,
        subject: 'Account Locked - Multiple Failed Login Attempts',
        html: `
          <h1>Account Locked</h1>
          <p>Dear ${user.name || user.email},</p>
          <p>Your account has been locked due to multiple failed login attempts.</p>
          <p>Please contact your administrator to unlock your account.</p>
          <br>
          <p>Best regards,<br>${config.fromName}</p>
        `
      })
    } catch (error) {
      console.error('Failed to send account locked notification:', error)
    }
  }
}