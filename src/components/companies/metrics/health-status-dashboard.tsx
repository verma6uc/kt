"use client"

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface HealthMetrics {
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

interface Props {
  metrics: HealthMetrics
}

export function HealthStatusDashboard({ metrics }: Props) {
  const healthStatus = useMemo(() => {
    if (metrics.current.criticalIssues > 0 || metrics.current.errorRate > 5) {
      return 'critical'
    }
    if (metrics.current.errorRate > 1 || metrics.current.responseTime > 1000) {
      return 'warning'
    }
    return 'healthy'
  }, [metrics])

  const statusColor = {
    healthy: 'bg-green-50 text-green-700 ring-green-600/20',
    warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
    critical: 'bg-red-50 text-red-700 ring-red-600/20'
  }

  const statusIcon = {
    healthy: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <Clock className="h-5 w-5 text-yellow-500" />,
    critical: <AlertTriangle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Overall Health Status */}
      <div className={`rounded-md px-4 py-3 ${statusColor[healthStatus]}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {statusIcon[healthStatus]}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">
              System Status: {healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)}
            </h3>
            <div className="mt-2 text-sm">
              {metrics.current.criticalIssues > 0 && (
                <p>Critical Issues: {metrics.current.criticalIssues}</p>
              )}
              <p>Error Rate: {metrics.current.errorRate.toFixed(2)}%</p>
              <p>Response Time: {metrics.current.responseTime.toFixed(2)}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Uptime</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.current.uptime.toFixed(2)}%
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.current.activeUsers}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Response Time</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.current.responseTime.toFixed(2)}ms
            </dd>
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-base font-medium text-gray-900">Resource Usage</h4>
          <div className="mt-4 space-y-4">
            {metrics.resourceUsage.map((resource, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {resource.resource_type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {resource.usage_value} {resource.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(resource.usage_value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Errors */}
      {metrics.errorLogs.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-gray-900">Recent Errors</h4>
            <div className="mt-4 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                          Error Type
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Count
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {metrics.errorLogs.map((error, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                            {error.error_type}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {error.count}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(error.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}