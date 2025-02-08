import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email-service'
import crypto from 'crypto'

function formatDateTime(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  }
  return new Date(date).toLocaleString(undefined, options)
}

function generateInvitationEmailTemplate(params: {
  companyName: string
  invitationLink: string
  expiresAt: Date
}) {
  const { companyName, invitationLink, expiresAt } = params

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Invitation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: #3b82f6;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 32px 24px;
          background: white;
        }
        .message {
          color: #374151;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin: 16px 0;
          text-align: center;
        }
        .button:hover {
          background: #2563eb;
        }
        .footer {
          padding: 24px;
          background: #f8fafc;
          text-align: center;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
        }
        .note {
          font-size: 14px;
          color: #64748b;
          margin-top: 16px;
        }
        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Admin Invitation</h1>
        </div>
        <div class="content">
          <div class="message">
            <p>Hello,</p>
            <p>You have been invited to be a Company Admin for <strong>${companyName}</strong>.</p>
            <p>As a Company Admin, you'll have access to:</p>
            <ul>
              <li>Company dashboard and analytics</li>
              <li>User management tools</li>
              <li>System configuration settings</li>
              <li>Performance monitoring features</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          <div class="note">
            <p>This invitation will expire at ${formatDateTime(expiresAt)}. For security reasons, please do not forward this email to anyone.</p>
          </div>
          <div class="divider"></div>
          <div class="note">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${invitationLink}</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        role: true
      }
    })

    if (!user || user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const companyId = parseInt(params.id)

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true }
    })

    if (!company) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Get invitations
    const invitations = await prisma.company_invitation.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        email: true,
        status: true,
        created_at: true,
        expires_at: true,
        accepted_at: true,
        cancelled_at: true,
        reminder_sent_at: true,
        reminder_count: true
      }
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        name: true, 
        role: true,
        email: true 
      }
    })

    if (!user || user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const companyId = parseInt(params.id)
    const { email } = await request.json()

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true }
    })

    if (!company) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Check if email is already associated with any user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse('Email already in use', { status: 400 })
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.company_invitation.findFirst({
      where: {
        company_id: companyId,
        email,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return new NextResponse('Invitation already sent', { status: 400 })
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry
    const now = new Date()

    // Create invitation
    const invitation = await prisma.company_invitation.create({
      data: {
        uuid: crypto.randomUUID(),
        company_id: companyId,
        email,
        name: email, // Using email as name since we need a string value
        token,
        expires_at: expiresAt,
        created_by_id: user.id,
        created_by_name: user.name || user.email,
        role: 'company_admin',
        created_at: now,
        updated_at: now,
        status: 'pending'
      }
    })

    // Create audit log
    await prisma.audit_log.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: user.id,
        company_id: companyId,
        action: 'invitation_sent',
        details: `Invitation sent to ${email} for company ${company.name}`,
        ip_address: request.headers.get('x-forwarded-for'),
        user_agent: request.headers.get('user-agent')
      }
    })

    // Send invitation email
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`
    const emailHtml = generateInvitationEmailTemplate({
      companyName: company.name,
      invitationLink,
      expiresAt
    })

    await sendEmail({
      to: email,
      subject: `Company Admin Invitation - ${company.name}`,
      text: `
        You have been invited to be a Company Admin for ${company.name}.
        
        Click the link below to accept the invitation and set up your account:
        ${invitationLink}
        
        This invitation will expire at ${formatDateTime(expiresAt)}.
      `,
      html: emailHtml
    })

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expires_at: invitation.expires_at
      }
    })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Check if user is super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        name: true, 
        role: true,
        email: true 
      }
    })

    if (!user || user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const companyId = parseInt(params.id)
    const { invitationId, action } = await request.json()

    // Check if invitation exists
    const invitation = await prisma.company_invitation.findFirst({
      where: {
        id: invitationId,
        company_id: companyId
      },
      include: {
        company: {
          select: { name: true }
        }
      }
    })

    if (!invitation) {
      return new NextResponse('Invitation not found', { status: 404 })
    }

    if (action === 'resend') {
      if (invitation.status !== 'pending') {
        return new NextResponse('Can only resend pending invitations', { status: 400 })
      }

      // Generate new token
      const newToken = crypto.randomBytes(32).toString('hex')
      const newExpiresAt = new Date()
      newExpiresAt.setDate(newExpiresAt.getDate() + 7)

      // Update invitation
      const updatedInvitation = await prisma.company_invitation.update({
        where: { id: invitationId },
        data: {
          token: newToken,
          expires_at: newExpiresAt,
          reminder_sent_at: new Date(),
          reminder_count: { increment: 1 },
          updated_at: new Date()
        }
      })

      // Create audit log
      await prisma.audit_log.create({
        data: {
          uuid: crypto.randomUUID(),
          user_id: user.id,
          company_id: companyId,
          action: 'invitation_resent',
          details: `Invitation resent to ${invitation.email} for company ${invitation.company.name}`,
          ip_address: request.headers.get('x-forwarded-for'),
          user_agent: request.headers.get('user-agent')
        }
      })

      // Send new invitation email
      const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${newToken}`
      const emailHtml = generateInvitationEmailTemplate({
        companyName: invitation.company.name,
        invitationLink,
        expiresAt: newExpiresAt
      })

      await sendEmail({
        to: invitation.email,
        subject: `Company Admin Invitation - ${invitation.company.name}`,
        text: `
          You have been invited to be a Company Admin for ${invitation.company.name}.
          
          Click the link below to accept the invitation and set up your account:
          ${invitationLink}
          
          This invitation will expire at ${formatDateTime(newExpiresAt)}. Any previous invitation links are no longer valid.
        `,
        html: emailHtml
      })

      return NextResponse.json({
        message: 'Invitation resent successfully',
        invitation: {
          id: updatedInvitation.id,
          email: updatedInvitation.email,
          expires_at: updatedInvitation.expires_at
        }
      })
    } else if (action === 'cancel') {
      if (invitation.status !== 'pending') {
        return new NextResponse('Can only cancel pending invitations', { status: 400 })
      }

      // Update invitation
      const updatedInvitation = await prisma.company_invitation.update({
        where: { id: invitationId },
        data: {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancelled_by_id: user.id,
          cancelled_by_name: user.name || user.email,
          updated_at: new Date()
        }
      })

      // Create audit log
      await prisma.audit_log.create({
        data: {
          uuid: crypto.randomUUID(),
          user_id: user.id,
          company_id: companyId,
          action: 'invitation_cancelled',
          details: `Invitation cancelled for ${invitation.email} for company ${invitation.company.name}`,
          ip_address: request.headers.get('x-forwarded-for'),
          user_agent: request.headers.get('user-agent')
        }
      })

      return NextResponse.json({
        message: 'Invitation cancelled successfully',
        invitation: {
          id: updatedInvitation.id,
          email: updatedInvitation.email,
          status: updatedInvitation.status
        }
      })
    }

    return new NextResponse('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Error updating invitation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}