import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export class AuthService {
  // Check if password was used before
  static async isPasswordPreviouslyUsed(
    userId: string,
    companyId: string,
    newPassword: string
  ): Promise<boolean> {
    const company = await prisma.company.findUnique({
      where: { id: parseInt(companyId) },
      include: { security_config: true }
    })

    const historyLimit = company?.security_config?.password_history_limit ?? 3
    
    const passwordHistory = await prisma.password_history.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { created_at: 'desc' },
      take: historyLimit
    })

    for (const history of passwordHistory) {
      const match = await bcrypt.compare(newPassword, history.password)
      if (match) return true
    }

    return false
  }

  // Handle failed login attempt
  static async handleFailedLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        company: {
          include: { security_config: true }
        }
      }
    })

    if (!user || !user.company.security_config) return false

    const maxAttempts = user.company.security_config.max_failed_attempts
    const newAttempts = user.failed_login_attempts + 1

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        failed_login_attempts: newAttempts,
        last_failed_attempt: new Date(),
        status: newAttempts >= maxAttempts ? 'locked' : user.status
      }
    })

    // Log the failed attempt
    await this.logAudit({
      userId,
      companyId: user.company_id.toString(),
      action: 'login_failed',
      details: `Failed login attempt ${newAttempts}/${maxAttempts}`,
      ipAddress,
      userAgent
    })

    return newAttempts >= maxAttempts
  }

  // Reset failed login attempts
  static async resetFailedAttempts(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        failed_login_attempts: 0,
        last_failed_attempt: null
      }
    })
  }

  // Check if user can login (not locked)
  static async canUserLogin(userId: string): Promise<{
    canLogin: boolean
    reason?: string
  }> {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        company: {
          include: { security_config: true }
        }
      }
    })

    if (!user) {
      return { canLogin: false, reason: 'User not found' }
    }

    if (user.status === 'locked') {
      return { canLogin: false, reason: 'Account is locked' }
    }

    return { canLogin: true }
  }

  // Check if password needs to be changed
  static async doesPasswordNeedChange(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        company: {
          include: { security_config: true }
        }
      }
    })

    if (!user || !user.company.security_config) return false

    const lastChange = user.last_password_change
    const expiryDays = user.company.security_config.password_expiry_days
    const expiryDate = new Date(lastChange)
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    return new Date() > expiryDate
  }

  // Add password to history
  static async addPasswordToHistory(
    userId: string,
    companyId: string,
    hashedPassword: string
  ): Promise<void> {
    await prisma.password_history.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        password: hashedPassword
      }
    })
  }

  // Log audit event
  static async logAudit({
    userId,
    companyId,
    action,
    details,
    ipAddress,
    userAgent
  }: {
    userId: string
    companyId: string
    action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_change' | 'password_reset' | 'settings_change' | 'login_failed'
    details: string
    ipAddress?: string
    userAgent?: string
  }): Promise<void> {
    const auditLog = await prisma.audit_log.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: parseInt(userId),
        company_id: parseInt(companyId),
        action,
        details,
        ip_address: ipAddress,
        user_agent: userAgent
      }
    })

    // Add audit metadata
    if (action === 'login' || action === 'login_failed') {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      })

      if (user) {
        await prisma.audit_metadata.create({
          data: {
            audit_log_id: auditLog.id,
            key: 'email',
            value: user.email
          }
        })

        await prisma.audit_metadata.create({
          data: {
            audit_log_id: auditLog.id,
            key: 'timestamp',
            value: new Date().toISOString()
          }
        })
      }
    }
  }

  // Check session timeout
  static async getSessionTimeout(companyId: string): Promise<number> {
    const config = await prisma.security_config.findUnique({
      where: { company_id: parseInt(companyId) }
    })

    return config?.session_timeout_mins ?? 60 // Default 60 minutes
  }

  // Change password with all validations
  static async changePassword({
    userId,
    companyId,
    newPassword,
    ipAddress,
    userAgent
  }: {
    userId: string
    companyId: string
    newPassword: string
    ipAddress?: string
    userAgent?: string
  }): Promise<boolean> {
    // Check if password was previously used
    const wasUsed = await this.isPasswordPreviouslyUsed(userId, companyId, newPassword)
    if (wasUsed) {
      throw new Error('Password was previously used')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password and last change date
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        password: hashedPassword,
        last_password_change: new Date(),
        status: 'active', // Unlock account if it was locked
        failed_login_attempts: 0 // Reset failed attempts
      }
    })

    // Add to password history
    await this.addPasswordToHistory(userId, companyId, hashedPassword)

    // Log the change
    await this.logAudit({
      userId,
      companyId,
      action: 'password_change',
      details: 'Password changed successfully',
      ipAddress,
      userAgent
    })

    return true
  }
}