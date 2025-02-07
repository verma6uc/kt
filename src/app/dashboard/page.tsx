"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Users, Activity, Server, Bell, Shield, Database, Clock } from "lucide-react"
import { Company } from "@/types/company"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) throw new Error('Failed to fetch companies')
        const companies: Company[] = await response.json()
        
        // Calculate basic stats
        const activeCompanies = companies.filter(c => c.status === 'active').length
        const totalUsers = companies.reduce((sum, company) => sum + company._count.users, 0)
        const totalApiCalls = companies.reduce((sum, company) => sum + company._count.api_metrics, 0)
        const avgApiCalls = Math.round(totalApiCalls / companies.length)
        
        // Calculate health stats
        const healthyCompanies = companies.filter(c => 
          c.company_health[0]?.status === 'healthy'
        ).length

        // Calculate average response time from recent API metrics
        const allResponseTimes = companies.flatMap(c => 
          c.api_metrics.map(m => m.duration_ms)
        )
        const avgResponseTime = Math.round(
          allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
        )

        // Calculate average uptime
        const avgUptime = companies.reduce((sum, c) => 
          sum + (c.company_health[0]?.uptime_percentage || 100)
        , 0) / companies.length

        // Calculate status distribution
        const statusCounts = companies.reduce((acc, company) => {
          acc[company.status] = (acc[company.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Calculate health distribution
        const healthCounts = companies.reduce((acc, company) => {
          const health = company.company_health[0]?.status || 'unknown'
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
        const initialApiCallsByDay = last7Days.reduce((acc, day) => {
          acc[day] = 0
          return acc
        }, {} as Record<string, number>)

        // Count API calls for each day
        const apiCallsByDay = companies.reduce((acc, company) => {
          company.api_metrics.forEach(metric => {
            const day = new Date(metric.created_at).toLocaleDateString('en-US', { weekday: 'short' })
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

    if (session?.user) {
      fetchStats()
    }
  }, [session])

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
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
          'rgba(34, 197, 94, 0.8)',  // active - green
          'rgba(234, 179, 8, 0.8)',   // pending_setup - yellow
          'rgba(239, 68, 68, 0.8)',   // suspended - red
          'rgba(156, 163, 175, 0.8)', // inactive - gray
        ],
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor key metrics and system performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Companies Card */}
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Companies</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalCompanies}</div>
                    <div className="ml-2 text-sm font-medium text-green-600">
                      {stats.activeCompanies} active
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
                    <div className="ml-2 text-sm font-medium text-gray-600">
                      across all companies
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* API Calls Card */}
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total API Calls</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalApiCalls.toLocaleString()}</div>
                    <div className="ml-2 text-sm font-medium text-gray-600">
                      avg {stats.averageApiCalls}/company
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Server className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.uptime.toFixed(2)}%</div>
                    <div className="ml-2 text-sm font-medium text-green-600">
                      uptime
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* API Calls Chart */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">API Calls Over Time</h3>
            <div className="mt-2 h-80">
              <Line data={apiCallsChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Company Status Distribution */}
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Company Status</h3>
            <div className="mt-2 h-80">
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Alerts</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalCompanies - stats.healthyCompanies}
                    </div>
                    <div className="ml-2 text-sm font-medium text-green-600">
                      companies need attention
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Security Status</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.healthyCompanies}</div>
                    <div className="ml-2 text-sm font-medium text-green-600">
                      companies secure
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">API Success Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {((stats.apiCallsOverTime.data.reduce((a, b) => a + b, 0) / 
                        (stats.apiCallsOverTime.data.length || 1)) || 0).toFixed(0)}
                    </div>
                    <div className="ml-2 text-sm font-medium text-gray-600">
                      calls/day
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Response Time</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.averageResponseTime}ms</div>
                    <div className="ml-2 text-sm font-medium text-green-600">
                      avg
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}