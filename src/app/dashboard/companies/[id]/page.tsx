"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Activity, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { HealthStatusDashboard } from "@/components/companies/metrics/health-status-dashboard"
import { PlatformUsageAnalytics } from "@/components/companies/metrics/platform-usage-analytics"
import { GrowthTrendsAnalysis } from "@/components/companies/metrics/growth-trends-analysis"

interface CompanyMetrics {
  company: {
    id: number
    name: string
    identifier: string
  }
  metrics: {
    health: {
      current: {
        uptime: number
        errorRate: number
        responseTime: number
        activeUsers: number
        criticalIssues: number
      }
      errorLogs: Array<{
        date: string
        error_type: string
        count: number
      }>
      resourceUsage: Array<{
        resource_type: string
        usage_value: number
        unit: string
      }>
    }
    usage: {
      patterns: {
        dailyActiveUsers: Array<{
          date: string
          count: number
        }>
        featureUsage: Array<{
          name: string
          count: number
        }>
      }
      systemMetrics: Array<{
        metric_type: string
        value: number
        unit: string
      }>
      apiMetrics: Array<{
        endpoint: string
        status_code: number
        duration_ms: number
      }>
    }
    growth: {
      activeUsers: Array<{
        date: string
        count: number
      }>
      apiUsage: Array<{
        date: string
        count: number
      }>
      storage: Array<{
        date: string
        value: number
      }>
    }
  }
}

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<CompanyMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Super admin check
  useEffect(() => {
    if (session?.user && session.user.role !== 'super_admin') {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/companies/${params.id}/metrics`)
        if (!response.ok) {
          throw new Error('Failed to fetch company metrics')
        }
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user && session.user.role === 'super_admin') {
      fetchMetrics()
    }
  }, [session, params.id])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'super_admin') {
    return null
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{metrics.company.name}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Detailed metrics and analytics for company ID: {metrics.company.identifier}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8">
        {/* Health Status Dashboard */}
        <div className="bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Health Status
            </h2>
            <HealthStatusDashboard metrics={metrics.metrics.health} />
          </div>
        </div>

        {/* Platform Usage Analytics */}
        <div className="bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              Platform Usage
            </h2>
            <PlatformUsageAnalytics metrics={metrics.metrics.usage} />
          </div>
        </div>

        {/* Growth Trends Analysis */}
        <div className="bg-white/70 backdrop-blur-sm shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Growth Trends
            </h2>
            <GrowthTrendsAnalysis metrics={metrics.metrics.growth} />
          </div>
        </div>
      </div>
    </div>
  )
}