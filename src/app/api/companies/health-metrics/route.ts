import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get the latest health metrics for each company
    const healthMetrics = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
        status: true,
        company_health: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1,
          select: {
            status: true,
            error_rate: true,
            avg_response_time: true,
            uptime_percentage: true,
            active_users: true,
            critical_issues: true,
            created_at: true
          }
        },
        api_metrics: {
          where: {
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          select: {
            status_code: true,
            duration_ms: true,
            created_at: true
          }
        }
      }
    })

    // Transform the data to include aggregated API metrics
    const transformedMetrics = healthMetrics.map(company => {
      const apiMetrics = company.api_metrics
      const totalCalls = apiMetrics.length
      const successfulCalls = apiMetrics.filter(m => m.status_code >= 200 && m.status_code < 300).length
      const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.duration_ms, 0) / (totalCalls || 1)

      return {
        company: {
          id: company.id,
          name: company.name,
          identifier: company.identifier,
          status: company.status
        },
        health: company.company_health[0] || {
          status: 'healthy',
          error_rate: 0,
          avg_response_time: 0,
          uptime_percentage: 100,
          active_users: 0,
          critical_issues: 0,
          created_at: new Date()
        },
        api_metrics: {
          total_calls: totalCalls,
          successful_calls: successfulCalls,
          success_rate: totalCalls ? (successfulCalls / totalCalls) * 100 : 100,
          avg_response_time: avgResponseTime
        }
      }
    })

    // Sort by health status (critical first, then warning, then healthy)
    const sortedMetrics = transformedMetrics.sort((a, b) => {
      const statusOrder = { critical: 0, warning: 1, healthy: 2 }
      return statusOrder[a.health.status as keyof typeof statusOrder] - 
             statusOrder[b.health.status as keyof typeof statusOrder]
    })

    return NextResponse.json({
      metrics: sortedMetrics,
      total_companies: sortedMetrics.length,
      critical_companies: sortedMetrics.filter(m => m.health.status === 'critical').length,
      warning_companies: sortedMetrics.filter(m => m.health.status === 'warning').length,
      healthy_companies: sortedMetrics.filter(m => m.health.status === 'healthy').length
    })
  } catch (error) {
    console.error('Error fetching health metrics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}