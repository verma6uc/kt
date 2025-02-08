"use client"

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface HealthMetric {
  company: {
    id: number
    name: string
    identifier: string
    status: string
  }
  health: {
    status: string
    error_rate: number
    avg_response_time: number
    uptime_percentage: number
    active_users: number
    critical_issues: number
    created_at: string
  }
  api_metrics: {
    total_calls: number
    successful_calls: number
    success_rate: number
    avg_response_time: number
  }
}

interface HealthMetricsResponse {
  metrics: HealthMetric[]
  total_companies: number
  critical_companies: number
  warning_companies: number
  healthy_companies: number
}

export function HealthMetricsTable() {
  const [data, setData] = useState<HealthMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHealthMetrics() {
      try {
        const response = await fetch('/api/companies/health-metrics')
        if (!response.ok) throw new Error('Failed to fetch health metrics')
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHealthMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Companies</div>
          <div className="text-2xl font-semibold">{data.total_companies}</div>
        </div>
        <div className="bg-red-50/70 backdrop-blur-sm p-4 rounded-lg shadow">
          <div className="text-sm text-red-600">Critical</div>
          <div className="text-2xl font-semibold">{data.critical_companies}</div>
        </div>
        <div className="bg-yellow-50/70 backdrop-blur-sm p-4 rounded-lg shadow">
          <div className="text-sm text-yellow-600">Warning</div>
          <div className="text-2xl font-semibold">{data.warning_companies}</div>
        </div>
        <div className="bg-green-50/70 backdrop-blur-sm p-4 rounded-lg shadow">
          <div className="text-sm text-green-600">Healthy</div>
          <div className="text-2xl font-semibold">{data.healthy_companies}</div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white/70 backdrop-blur-sm shadow ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Company
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Health Status
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                API Metrics
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                System Health
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.metrics.map((metric) => (
              <tr key={metric.company.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="font-medium text-gray-900">{metric.company.name}</div>
                  <div className="text-gray-500">{metric.company.identifier}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <div className="flex items-center">
                    {metric.health.status === 'critical' ? (
                      <XCircle className="h-5 w-5 text-red-500 mr-1.5" />
                    ) : metric.health.status === 'warning' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-1.5" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-1.5" />
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.health.status === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : metric.health.status === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {metric.health.status.charAt(0).toUpperCase() + metric.health.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <div className="text-gray-900">
                    {metric.api_metrics.total_calls} calls ({metric.api_metrics.success_rate.toFixed(1)}% success)
                  </div>
                  <div className="text-gray-500">{Math.round(metric.api_metrics.avg_response_time)}ms avg response</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <div className="text-gray-900">{metric.health.uptime_percentage.toFixed(2)}% uptime</div>
                  <div className="text-gray-500">
                    {metric.health.critical_issues} critical issues
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDistanceToNow(new Date(metric.health.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}