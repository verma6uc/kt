import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, audit_action } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') as audit_action | undefined
    const companyId = searchParams.get('companyId') || undefined
    const userId = searchParams.get('userId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    // Build where clause for search and filters
    const whereClause: Prisma.audit_logWhereInput = {
      AND: [
        // Search in details
        search ? {
          OR: [
            { details: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { ip_address: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { user_agent: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        // Action filter
        action ? { action } : {},
        // Company filter
        companyId ? { company_id: parseInt(companyId) } : {},
        // User filter
        userId ? { user_id: parseInt(userId) } : {},
        // Date range filter
        startDate || endDate ? {
          created_at: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {}
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.audit_log.count({
      where: whereClause
    })

    // Get audit logs with pagination, search, and sorting
    const auditLogs = await prisma.audit_log.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            identifier: true
          }
        }
      }
    })

    // Get metadata for each audit log
    const auditLogsWithMetadata = await Promise.all(
      auditLogs.map(async (log) => {
        const metadata = await prisma.audit_metadata.findMany({
          where: { audit_log_id: log.id }
        })
        return {
          ...log,
          metadata
        }
      })
    )

    return NextResponse.json({
      auditLogs: auditLogsWithMetadata,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}