import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { userIds, companyId, reason } = data

    if (!userIds && !companyId) {
      return new NextResponse('Either userIds or companyId is required', { status: 400 })
    }

    const performedByUserId = parseInt(session.user.id)

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      let sessionsToDelete = {}

      if (companyId) {
        // Get all users of the company
        const users = await tx.user.findMany({
          where: { company_id: companyId },
          select: { id: true }
        })
        sessionsToDelete = {
          user_id: {
            in: users.map(user => user.id)
          }
        }
      } else if (userIds) {
        sessionsToDelete = {
          user_id: {
            in: userIds.map((id: string) => parseInt(id))
          }
        }
      }

      // Delete sessions
      const deleteResult = await tx.session.deleteMany({
        where: sessionsToDelete
      })

      // Create audit log
      await tx.audit_log.create({
        data: {
          uuid: uuidv4(),
          user_id: performedByUserId,
          company_id: companyId || undefined,
          action: 'update',
          details: `Sessions invalidated: ${deleteResult.count} sessions were terminated. Reason: ${reason}`
        }
      })

      return deleteResult
    })

    return NextResponse.json({
      success: true,
      sessionsTerminated: result.count
    })
  } catch (error) {
    console.error('Error invalidating sessions:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'Failed to invalidate sessions',
      { status: 500 }
    )
  }
}