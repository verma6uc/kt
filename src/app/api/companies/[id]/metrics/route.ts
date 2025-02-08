import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { MetricsResponse } from '@/types/metrics'

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
    const { id } = await context.params
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

    // Calculate date range for metrics
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get company health metrics
    const healthMetrics = await prisma.company_health.findFirst({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
      select: {
        status: true,
        uptime_percentage: true,
        error_rate: true,
        avg_response_time: true,
        active_users: true,
        critical_issues: true,
        created_at: true
      }
    })

    // Get system metrics
    const systemMetrics = await prisma.system_metrics.findMany({
      where: {
        company_id: companyId,
        created_at: { gte: thirtyDaysAgo }
      },
      orderBy: { created_at: 'asc' },
      select: {
        metric_type: true,
        value: true,
        unit: true,
        created_at: true
      }
    })

    // Get API metrics
    const apiMetrics = await prisma.api_metrics.findMany({
      where: {
        company_id: companyId,
        created_at: { gte: thirtyDaysAgo }
      },
      orderBy: { created_at: 'asc' },
      select: {
        endpoint: true,
        method: true,
        status_code: true,
        duration_ms: true,
        created_at: true
      }
    })

    // Get user activity using raw SQL due to table name mapping
    const userActivity = await prisma.$queryRaw<{ date: Date; session_count: number }[]>`
      SELECT date, session_count
      FROM user_activity
      WHERE company_id = ${companyId}
      AND date >= ${thirtyDaysAgo}
      ORDER BY date ASC
    `

    // Get feature usage using raw SQL due to table name mapping
    const featureUsage = await prisma.$queryRaw<{ feature_name: string; usage_count: number; created_at: Date }[]>`
      SELECT feature_name, usage_count, created_at
      FROM feature_usage
      WHERE company_id = ${companyId}
      AND created_at >= ${thirtyDaysAgo}
      ORDER BY created_at ASC
    `

    // Get growth metrics using raw SQL due to table name mapping
    const growthMetrics = await prisma.$queryRaw<{ active_users: number; total_storage: number; api_calls: number; created_at: Date }[]>`
      SELECT active_users, total_storage, api_calls, created_at
      FROM growth_metrics
      WHERE company_id = ${companyId}
      AND created_at >= ${thirtyDaysAgo}
      ORDER BY created_at ASC
    `

    // Get error logs using raw SQL due to table name mapping
    const errorLogs = await prisma.$queryRaw<{ date: Date; error_type: string; count: number }[]>`
      SELECT date, error_type, count
      FROM error_logs
      WHERE company_id = ${companyId}
      AND date >= ${thirtyDaysAgo}
      ORDER BY date DESC
    `

    // Get resource usage using raw SQL due to table name mapping
    const resourceUsage = await prisma.$queryRaw<{ resource_type: string; usage_value: number; unit: string; created_at: Date }[]>`
      SELECT resource_type, usage_value, unit, created_at
      FROM resource_usage
      WHERE company_id = ${companyId}
      AND created_at >= ${thirtyDaysAgo}
      ORDER BY created_at ASC
    `

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
            status: healthMetrics?.status || 'healthy',
            uptime: healthMetrics?.uptime_percentage || 100,
            errorRate: healthMetrics?.error_rate || 0,
            responseTime: healthMetrics?.avg_response_time || 0,
            activeUsers: healthMetrics?.active_users || 0,
            criticalIssues: healthMetrics?.critical_issues || 0,
            lastUpdated: healthMetrics?.created_at || new Date()
          },
          errorLogs,
          resourceUsage
        },
        usage: {
          patterns: {
            dailyActiveUsers: userActivity.map(day => ({
              date: day.date,
              count: day.session_count
            })),
            featureUsage: featureUsage.map(feature => ({
              name: feature.feature_name,
              count: feature.usage_count,
              date: feature.created_at
            }))
          },
          systemMetrics,
          apiMetrics
        },
        growth: {
          trends: growthMetrics.map(metric => ({
            date: metric.created_at,
            activeUsers: metric.active_users,
            storage: metric.total_storage,
            apiCalls: metric.api_calls
          }))
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching company metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}