"use client"

import "@/lib/chart-config"
import { useEffect, useState } from "react"
import { Company } from "@/types/company"
import { Building2, Users, Activity, Server, Bell, Shield, Database, Clock } from "lucide-react"
import { StatsCard } from "./stats-card"
import { LineChart } from "./line-chart"
import { BarChart } from "./bar-chart"

interface DashboardStats {
  totalCompanies: number
  totalUsers: number
  activeCompanies: number
  averageApiCalls: number
  totalApiCalls: number
  healthyCompanies: number
  averageResponseTime: number
  uptime: number
  apiCallsOverTime: {
    labels: string[]
    data: number[]
  }
  statusDistribution: {
    labels: string[]
    data: number[]
  }
  healthDistribution: {
    labels: string[]
    data: number[]
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    totalUsers: 0,
    activeCompanies: 0,
    averageApiCalls: 0,
    totalApiCalls: 0,
    healthyCompanies: 0,
    averageResponseTime: 0,
    uptime: 0,
    apiCallsOverTime: {
      labels: [],
      data: []
    },
    statusDistribution: {
      labels: [],
      data: []
    },
    healthDistribution: {
      labels: [],
      data: []
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) throw new Error('Failed to fetch companies')
        const { companies } = await response.json()
        
        // Calculate basic stats
        const activeCompanies = companies.filter((c: Company) => c.status === 'active').length
        const totalUsers = companies.reduce((sum: number, company: Company) => 
          sum + (company._count?.user || 0), 0)
        const totalApiCalls = companies.reduce((sum: number, company: Company) => 
          sum + (company._count?.api_metrics || 0), 0)
        const avgApiCalls = companies.length > 0 ? Math.round(totalApiCalls / companies.length) : 0
        
        // Calculate health stats
        const healthyCompanies = companies.filter((c: Company) => 
          c.company_health && 
          c.company_health.length > 0 && 
          c.company_health[0]?.status === 'healthy'
        ).length

        // Calculate average response time from recent API metrics
        const allResponseTimes = companies.flatMap((c: Company) => 
          (c.api_metrics || []).map(m => m.response_time)
        ).filter(Boolean)
        
        const avgResponseTime = allResponseTimes.length > 0
          ? Math.round(allResponseTimes.reduce((sum: number, time: number) => sum + time, 0) / allResponseTimes.length)
          : 0

        // Calculate average uptime
        const uptimes: number[] = companies
          .map((c: Company) => 
            c.company_health && 
            c.company_health.length > 0 && 
            c.company_health[0]?.uptime_percentage !== undefined
              ? c.company_health[0].uptime_percentage
              : null
          )
          .filter((uptime: number | null): uptime is number => uptime !== null)
        
        const avgUptime = uptimes.length > 0
          ? uptimes.reduce((sum: number, uptime: number) => sum + uptime, 0) / uptimes.length
          : 100

        // Calculate status distribution
        const statusCounts = companies.reduce((acc: Record<string, number>, company: Company) => {
          acc[company.status] = (acc[company.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Calculate health distribution
        const healthCounts = companies.reduce((acc: Record<string, number>, company: Company) => {
          const health = company.company_health && 
            company.company_health.length > 0 && 
            company.company_health[0]?.status
              ? company.company_health[0].status
              : 'unknown'
          acc[health] = (acc[health] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Calculate API calls over time (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toLocaleDateString('en-US', { weekday: 'short' })
        }).reverse()

        // Initialize API calls by day with 0 for each day
        const initialApiCallsByDay = last7Days.reduce((acc: Record<string, number>, day: string) => {
          acc[day] = 0
          return acc
        }, {} as Record<string, number>)

        // Count API calls for each day
        const apiCallsByDay = companies.reduce((acc: Record<string, number>, company: Company) => {
          (company.api_metrics || []).forEach(metric => {
            const date = typeof metric.created_at === 'string' ? new Date(metric.created_at) : metric.created_at
            const day = date.toLocaleDateString('en-US', { weekday: 'short' })
            if (acc[day] !== undefined) {
              acc[day] += 1
            }
          })
          return acc
        }, initialApiCallsByDay)

        const apiCallsData = last7Days.map(day => apiCallsByDay[day])
        
        setStats({
          totalCompanies: companies.length,
          totalUsers,
          activeCompanies,
          averageApiCalls: avgApiCalls,
          totalApiCalls,
          healthyCompanies,
          averageResponseTime: avgResponseTime,
          uptime: avgUptime,
          apiCallsOverTime: {
            labels: last7Days,
            data: apiCallsData
          },
          statusDistribution: {
            labels: Object.keys(statusCounts),
            data: Object.values(statusCounts)
          },
          healthDistribution: {
            labels: Object.keys(healthCounts),
            data: Object.values(healthCounts)
          }
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const apiCallsChartData = {
    labels: stats.apiCallsOverTime.labels,
    datasets: [
      {
        label: 'API Calls',
        data: stats.apiCallsOverTime.data,
        fill: true,
        borderColor: 'rgb(99, 102, 241)', // Indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const statusChartData = {
    labels: stats.statusDistribution.labels.map(s => s.replace('_', ' ')),
    datasets: [
      {
        label: 'Companies by Status',
        data: stats.statusDistribution.data,
        backgroundColor: [
          'rgba(79, 70, 229, 0.9)',   // active - indigo-600
          'rgba(245, 158, 11, 0.9)',  // pending_setup - amber-500
          'rgba(239, 68, 68, 0.9)',   // suspended - red-500
          'rgba(107, 114, 128, 0.9)', // inactive - gray-500
        ],
        borderColor: [
          'rgba(79, 70, 229, 1)',    // active - indigo-600
          'rgba(245, 158, 11, 1)',   // pending_setup - amber-500
          'rgba(239, 68, 68, 1)',    // suspended - red-500
          'rgba(107, 114, 128, 1)',  // inactive - gray-500
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Companies"
          value={stats.totalCompanies}
          subtitle={`${stats.activeCompanies} active`}
          icon={Building2}
          subtitleColor="text-indigo-600"
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="across all companies"
          icon={Users}
        />
        <StatsCard
          title="Total API Calls"
          value={stats.totalApiCalls.toLocaleString()}
          subtitle={`avg ${stats.averageApiCalls}/company`}
          icon={Activity}
        />
        <StatsCard
          title="System Health"
          value={`${stats.uptime.toFixed(2)}%`}
          subtitle="uptime"
          icon={Server}
          subtitleColor="text-indigo-600"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <LineChart title="API Calls Over Time" data={apiCallsChartData} />
        <BarChart title="Company Status" data={statusChartData} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Alerts"
          value={stats.totalCompanies - stats.healthyCompanies}
          subtitle="companies need attention"
          icon={Bell}
          subtitleColor="text-indigo-600"
        />
        <StatsCard
          title="Security Status"
          value={stats.healthyCompanies}
          subtitle="companies secure"
          icon={Shield}
          subtitleColor="text-indigo-600"
        />
        <StatsCard
          title="API Success Rate"
          value={((stats.apiCallsOverTime.data.reduce((a: number, b: number) => a + b, 0) / 
            (stats.apiCallsOverTime.data.length || 1)) || 0).toFixed(0)}
          subtitle="calls/day"
          icon={Database}
        />
        <StatsCard
          title="Response Time"
          value={`${stats.averageResponseTime}ms`}
          subtitle="avg"
          icon={Clock}
          subtitleColor="text-indigo-600"
        />
      </div>
    </div>
  )
}
