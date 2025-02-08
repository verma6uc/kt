import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, type audit_action } from '@prisma/client'
import type { MetricsResponse } from '@/types/metrics'

type ActivityType = 'info' | 'error' | 'warning' | 'success'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get company ID from params
    const { id } = context.params
    const companyId = parseInt(id)
    if (isNaN(companyId)) {
      return new NextResponse('Invalid company ID', { status: 400 })
    }

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        identifier: true,
        status: true
      }
    })

    if (!company) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Calculate time ranges
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // Get critical issues (HTTP 5xx errors in the last hour)
    const criticalIssues = await prisma.api_metrics.count({
      where: {
        company_id: companyId,
        created_at: { gte: oneHourAgo },
        status_code: { gte: 500 }
      }
    })

    // Calculate error rate for the last hour
    const hourlyMetrics = await prisma.api_metrics.groupBy({
      by: ['status_code'],
      where: {
        company_id: companyId,
        created_at: { gte: oneHourAgo }
      },
      _count: {
        _all: true
      }
    })

    const totalCalls = hourlyMetrics.reduce((sum, item) => sum + item._count._all, 0)
    const errorCalls = hourlyMetrics
      .filter(item => item.status_code >= 400)
      .reduce((sum, item) => sum + item._count._all, 0)
    const errorRate = totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0

    // Calculate average response time for the last hour
    const avgResponseTime = await prisma.api_metrics.aggregate({
      where: {
        company_id: companyId,
        created_at: { gte: oneHourAgo }
      },
      _avg: {
        duration_ms: true
      }
    })

    // Get unique active users in the last hour
    const activeUsers = await prisma.api_metrics.groupBy({
      by: ['user_id'],
      where: {
        company_id: companyId,
        created_at: { gte: oneHourAgo },
        user_id: { not: null }
      }
    })

    // Calculate uptime based on successful requests over the last 30 days
    const uptimeMetrics = await prisma.api_metrics.groupBy({
      by: ['status_code'],
      where: {
        company_id: companyId,
        created_at: { gte: thirtyDaysAgo }
      },
      _count: {
        _all: true
      }
    })

    const totalRequests = uptimeMetrics.reduce((sum, item) => sum + item._count._all, 0)
    const successfulRequests = uptimeMetrics
      .filter(item => item.status_code < 500)
      .reduce((sum, item) => sum + item._count._all, 0)
    const uptime = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100

    // Get recent activity (last 20 events)
    const recentActivity = await prisma.$transaction(async (tx) => {
      const logs = await tx.audit_log.findMany({
        where: {
          company_id: companyId
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 20,
        select: {
          id: true,
          action: true,
          details: true,
          created_at: true,
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        }
      })

      // Get metadata for each log
      const metadata = await tx.audit_metadata.findMany({
        where: {
          audit_log_id: {
            in: logs.map(log => log.id)
          }
        }
      })

      // Group metadata by audit_log_id
      const metadataByLogId = metadata.reduce((acc, meta) => {
        if (!acc[meta.audit_log_id]) {
          acc[meta.audit_log_id] = []
        }
        acc[meta.audit_log_id].push(meta)
        return acc
      }, {} as Record<number, typeof metadata>)

      return logs.map(log => ({
        ...log,
        metadata: metadataByLogId[log.id] || []
      }))
    })

    // Transform audit logs into activity format
    const formattedActivity = recentActivity.map(log => {
      const activityType: ActivityType = 
        log.action === 'create' ? 'success' :
        log.action === 'update' ? 'info' :
        log.action === 'delete' ? 'error' :
        log.action.includes('failed') ? 'warning' : 'info'

      const details: { [key: string]: string | number } = {
        user: log.user.name || log.user.email,
        role: log.user.role,
      }

      // Add metadata to details
      log.metadata.forEach(meta => {
        details[meta.key] = meta.value
      })

      return {
        id: log.id.toString(),
        type: activityType,
        title: log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' '),
        description: log.details,
        timestamp: log.created_at,
        details
      }
    })

    // Get daily metrics for the past 7 days
    const dailyMetricsRaw = await prisma.api_metrics.groupBy({
      by: ['created_at'],
      where: {
        company_id: companyId,
        created_at: { gte: sevenDaysAgo }
      },
      _count: {
        _all: true,
        status_code: true
      },
      _avg: {
        duration_ms: true
      },
      having: {
        created_at: {
          _count: {
            gt: 0
          }
        }
      }
    })

    // Process daily metrics
    const dailyMetrics = dailyMetricsRaw.map(day => {
      const errorCount = day._count.status_code || 0
      const totalCount = day._count._all || 0
      return {
        date: day.created_at,
        errorRate: totalCount > 0 ? (errorCount / totalCount) * 100 : 0,
        responseTime: day._avg.duration_ms || 0,
        totalRequests: totalCount
      }
    })

    // Format response
    const response: MetricsResponse = {
      company: {
        id: company.id,
        name: company.name,
        identifier: company.identifier
      },
      metrics: {
        health: {
          current: {
            status: criticalIssues > 0 ? 'critical' : errorRate > 5 ? 'warning' : 'healthy',
            uptime,
            errorRate,
            responseTime: avgResponseTime._avg.duration_ms || 0,
            activeUsers: activeUsers.length,
            criticalIssues,
            lastUpdated: new Date()
          },
          recentActivity: formattedActivity,
          dailyMetrics
        },
        api: {
          overview: {
            totalCalls,
            successfulCalls: totalCalls - errorCalls,
            errorCalls,
            successRate: totalCalls ? ((totalCalls - errorCalls) / totalCalls) * 100 : 100,
            errorRate
          },
          endpoints: [],
          statusCodes: hourlyMetrics.map(item => ({
            code: item.status_code,
            count: item._count._all
          })),
          timeline: []
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching company metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}