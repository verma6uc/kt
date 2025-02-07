"use client"

import { useMemo } from 'react'
import { BarChart, Users, Zap } from 'lucide-react'

interface UsageMetrics {
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

interface Props {
  metrics: UsageMetrics
}

export function PlatformUsageAnalytics({ metrics }: Props) {
  const averageDailyUsers = useMemo(() => {
    if (metrics.patterns.dailyActiveUsers.length === 0) return 0
    const total = metrics.patterns.dailyActiveUsers.reduce((sum, day) => sum + day.count, 0)
    return Math.round(total / metrics.patterns.dailyActiveUsers.length)
  }, [metrics.patterns.dailyActiveUsers])

  const topFeatures = useMemo(() => {
    return [...metrics.patterns.featureUsage]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [metrics.patterns.featureUsage])

  const apiHealthScore = useMemo(() => {
    if (metrics.apiMetrics.length === 0) return 100
    const successfulRequests = metrics.apiMetrics.filter(m => m.status_code < 400).length
    return Math.round((successfulRequests / metrics.apiMetrics.length) * 100)
  }, [metrics.apiMetrics])

  return (
    <div className="mt-6 space-y-8">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Daily Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {averageDailyUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Feature Adoption Rate
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {topFeatures.length} active features
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    API Health Score
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {apiHealthScore}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-base font-medium text-gray-900">Top Features</h4>
          <div className="mt-4 space-y-4">
            {topFeatures.map((feature, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {feature.count} uses
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(feature.count / topFeatures[0].count) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Active Users Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-base font-medium text-gray-900">Daily Active Users</h4>
          <div className="mt-4">
            <div className="h-64">
              <div className="flex h-full items-end space-x-2">
                {metrics.patterns.dailyActiveUsers.map((day, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-100 rounded-t"
                    style={{
                      height: `${(day.count / averageDailyUsers) * 50}%`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="w-full h-full bg-blue-500 opacity-75 rounded-t" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              {metrics.patterns.dailyActiveUsers.map((day, index) => (
                <div key={index}>
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Resource Usage */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-base font-medium text-gray-900">System Resource Usage</h4>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {metrics.systemMetrics.map((metric, index) => (
              <div key={index} className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.metric_type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {metric.value} {metric.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}