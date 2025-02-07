import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
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

    const companyId = parseInt(params.id)

    // Get company details
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: true
      }
    })

    if (!company) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Get latest health metrics
    const latestHealth = await prisma.company_health.findFirst({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' }
    })

    // Get system metrics for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const systemMetrics = await prisma.system_metrics.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { created_at: 'asc' }
    })

    // Get API metrics for the last 30 days
    const apiMetrics = await prisma.api_metrics.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { created_at: 'asc' }
    })

    // Get daily active users
    const dailyActiveUsers = await prisma.user_activity.groupBy({
      by: ['date'],
      where: {
        company_id: companyId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        session_count: true
      }
    })

    // Get feature usage
    const featureUsage = await prisma.feature_usage.groupBy({
      by: ['feature_name'],
      where: {
        company_id: companyId,
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        usage_count: true
      }
    })

    // Get growth metrics
    const growthMetrics = await prisma.growth_metrics.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { created_at: 'asc' }
    })

    // Get error logs
    const errorLogs = await prisma.error_logs.groupBy({
      by: ['date', 'error_type'],
      where: {
        company_id: companyId,
        date: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        count: true
      }
    })

    // Get resource usage
    const resourceUsage = await prisma.resource_usage.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: { created_at: 'asc' }
    })

    // Calculate health indicators
    const healthIndicators = {
      uptime: latestHealth?.uptime_percentage || 100,
      errorRate: latestHealth?.error_rate || 0,
      responseTime: latestHealth?.avg_response_time || 0,
      activeUsers: latestHealth?.active_users || 0,
      criticalIssues: latestHealth?.critical_issues || 0
    }

    // Calculate usage patterns
    const usagePatterns = {
      dailyActiveUsers: dailyActiveUsers.map(day => ({
        date: day.date,
        count: day._count.session_count
      })),
      featureUsage: featureUsage.map(feature => ({
        name: feature.feature_name,
        count: feature._sum.usage_count || 0
      }))
    }

    // Calculate growth trends
    const growthTrends = {
      activeUsers: growthMetrics.map(metric => ({
        date: metric.created_at,
        count: metric.active_users
      })),
      apiUsage: growthMetrics.map(metric => ({
        date: metric.created_at,
        count: metric.api_calls
      })),
      storage: growthMetrics.map(metric => ({
        date: metric.created_at,
        value: metric.total_storage
      }))
    }

    return NextResponse.json({
      company,
      metrics: {
        health: {
          current: healthIndicators,
          errorLogs,
          resourceUsage
        },
        usage: {
          patterns: usagePatterns,
          systemMetrics,
          apiMetrics
        },
        growth: growthTrends
      }
    })
  } catch (error) {
    console.error('Error fetching company metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}