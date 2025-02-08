import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-service'
import { getCompanyDeactivationEmailTemplate } from '@/lib/email-templates/company-deactivation'
import { v4 as uuidv4 } from 'uuid'
import { Prisma, user_role, audit_action } from '@prisma/client'

interface DeactivationResult {
  success: boolean
  error?: string
  usersUpdated: number
  emailsSent: number
}

interface CompanyAdmin {
  id: number
  email: string
}

export async function handleCompanyDeactivation(
  companyId: number,
  performedByUserId: number
): Promise<DeactivationResult> {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get company and its admins
      const company = await tx.company.findUnique({
        where: { id: companyId },
        include: {
          user: {
            where: {
              role: user_role.company_admin
            },
            select: {
              id: true,
              email: true
            }
          }
        }
      })

      if (!company) {
        throw new Error('Company not found')
      }

      // 2. Update all company users to suspended
      const updateUsersResult = await tx.user.updateMany({
        where: {
          company_id: companyId,
          status: {
            not: 'suspended'
          }
        },
        data: {
          status: 'suspended'
        }
      })

      // 3. Create audit log for company deactivation
      const deactivationAuditLog = await tx.audit_log.create({
        data: {
          uuid: uuidv4(),
          user_id: performedByUserId,
          company_id: companyId,
          action: audit_action.update,
          details: `Company ${company.name} (${company.identifier}) was deactivated. ${updateUsersResult.count} users were suspended.`
        }
      })

      // 4. Create audit logs for each user suspension
      if (updateUsersResult.count > 0) {
        await tx.audit_log.create({
          data: {
            uuid: uuidv4(),
            user_id: performedByUserId,
            company_id: companyId,
            action: audit_action.update,
            details: `${updateUsersResult.count} users were suspended due to company deactivation`
          }
        })
      }

      // 5. Send emails to all company admins
      const emailTemplate = getCompanyDeactivationEmailTemplate(company.name)
      const emailPromises = company.user.map((admin: CompanyAdmin) =>
        sendEmail({
          to: admin.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })
      )

      const emailResults = await Promise.allSettled(emailPromises)
      const successfulEmails = emailResults.filter(
        (result: PromiseSettledResult<unknown>): result is PromiseFulfilledResult<unknown> => 
        result.status === 'fulfilled'
      ).length

      return {
        success: true,
        usersUpdated: updateUsersResult.count,
        emailsSent: successfulEmails
      }
    })

    return result
  } catch (error) {
    console.error('Error in handleCompanyDeactivation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      usersUpdated: 0,
      emailsSent: 0
    }
  }
}