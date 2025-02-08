import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { addDays } from 'date-fns'
import { sendInvitationEmail } from '@/lib/email-service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = params
    const companyId = parseInt(id)
    const { email, name } = await request.json()

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse('Email already in use', { status: 400 })
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Get current user's ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!currentUser) {
      return new NextResponse('Current user not found', { status: 500 })
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    const expiresAt = addDays(new Date(), 7) // 7 days expiration

    // Create user and invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: '', // Will be set when user accepts invitation
          role: 'company_admin',
          status: 'pending_activation',
          company_id: companyId,
          invitation_token: token
        }
      })

      // Create invitation
      const invitation = await tx.company_invitation.create({
        data: {
          company_id: companyId,
          email,
          name,
          token,
          expires_at: expiresAt,
          created_by_id: currentUser.id,
          created_by_name: currentUser.name || 'Unknown',
          user_id: user.id
        }
      })

      // Create audit log
      await tx.audit_log.create({
        data: {
          user_id: currentUser.id,
          company_id: companyId,
          action: 'invitation_sent',
          details: `Invitation sent to ${email} for company admin role`
        }
      })

      return { user, invitation }
    })

    // Send invitation email
    await sendInvitationEmail({
      to: email,
      name,
      companyName: company.name,
      token,
      expiresAt
    })

    return NextResponse.json({
      message: 'Invitation sent successfully',
      data: {
        userId: result.user.id,
        invitationId: result.invitation.id
      }
    })
  } catch (error) {
    console.error('Error creating admin invitation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = params
    const companyId = parseInt(id)
    const { userId } = await request.json()
    const userIdNum = parseInt(userId)

    // Get current user's ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!currentUser) {
      return new NextResponse('Current user not found', { status: 500 })
    }

    // Check if user exists and is pending activation
    const user = await prisma.user.findFirst({
      where: {
        id: userIdNum,
        company_id: companyId,
        status: 'pending_activation'
      }
    })

    if (!user) {
      return new NextResponse('Invalid user or already activated', { status: 400 })
    }

    // Generate new token
    const token = randomBytes(32).toString('hex')
    const expiresAt = addDays(new Date(), 7)

    // Update invitation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Invalidate existing invitation
      await tx.company_invitation.updateMany({
        where: {
          user_id: userIdNum,
          status: 'pending'
        },
        data: {
          status: 'expired'
        }
      })

      // Create new invitation
      const invitation = await tx.company_invitation.create({
        data: {
          company_id: companyId,
          email: user.email,
          name: user.name || '',
          token,
          expires_at: expiresAt,
          created_by_id: currentUser.id,
          created_by_name: currentUser.name || 'Unknown',
          user_id: userIdNum
        }
      })

      // Update user token
      await tx.user.update({
        where: { id: userIdNum },
        data: { invitation_token: token }
      })

      // Create audit log
      await tx.audit_log.create({
        data: {
          user_id: currentUser.id,
          company_id: companyId,
          action: 'invitation_resent',
          details: `Invitation resent to ${user.email}`
        }
      })

      return { invitation }
    })

    // Send new invitation email
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    await sendInvitationEmail({
      to: user.email,
      name: user.name || '',
      companyName: company?.name || '',
      token,
      expiresAt
    })

    return NextResponse.json({
      message: 'Invitation resent successfully',
      data: {
        invitationId: result.invitation.id
      }
    })
  } catch (error) {
    console.error('Error resending invitation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = params
    const companyId = parseInt(id)
    const { userId } = await request.json()
    const userIdNum = parseInt(userId)

    // Get current user's ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })

    if (!currentUser) {
      return new NextResponse('Current user not found', { status: 500 })
    }

    // Check if user exists and is pending activation
    const user = await prisma.user.findFirst({
      where: {
        id: userIdNum,
        company_id: companyId,
        status: 'pending_activation'
      }
    })

    if (!user) {
      return new NextResponse('Invalid user or already activated', { status: 400 })
    }

    // Cancel invitation in transaction
    await prisma.$transaction(async (tx) => {
      // Invalidate existing invitations
      await tx.company_invitation.updateMany({
        where: {
          user_id: userIdNum,
          status: 'pending'
        },
        data: {
          status: 'cancelled',
          cancelled_at: new Date(),
          cancelled_by_id: currentUser.id,
          cancelled_by_name: currentUser.name || 'Unknown'
        }
      })

      // Update user status
      await tx.user.update({
        where: { id: userIdNum },
        data: {
          status: 'inactive',
          invitation_token: null
        }
      })

      // Create audit log
      await tx.audit_log.create({
        data: {
          user_id: currentUser.id,
          company_id: companyId,
          action: 'invitation_cancelled',
          details: `Invitation cancelled for ${user.email}`
        }
      })
    })

    return NextResponse.json({
      message: 'Invitation cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}