"use client"

import { useMemo } from 'react'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

interface GrowthMetrics {
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

interface Props {
  metrics: GrowthMetrics
}

export function GrowthTrendsAnalysis({ metrics }: Props) {
  const growthStats = useMemo(() => {
    const calculateGrowth = (data: Array<{ date: string, count?: number, value?: number }>) => {
      if (data.length < 2) return { current: 0, growth: 0, trend: 'neutral' as const }
      
      const current = data[data.length - 1]
      const previous = data[data.length - 2]
      const currentValue = 'count' in current ? current.count! : current.value!
      const previousValue = 'count' in previous ? previous.count! : previous.value!
      
      const growth = ((currentValue - previousValue) / previousValue) * 100
      
      return {
        current: currentValue,
        growth,
        trend: growth > 0 ? 'up' as const : growth < 0 ? 'down' as const : 'neutral' as const
      }
    }

    return {
      users: calculateGrowth(metrics.activeUsers),
      api: calculateGrowth(metrics.apiUsage),
      storage: calculateGrowth(metrics.storage)
    }
  }, [metrics])

  const formatTrend = (trend: { growth: number, trend: 'up' | 'down' | 'neutral' }) => {
    const color = trend.trend === 'up' ? 'text-green-600' : trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
    const Icon = trend.trend === 'up' ? TrendingUp : trend.trend === 'down' ? TrendingDown : ArrowRight
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-5 w-5 mr-1" />
        <span>{Math.abs(trend.growth).toFixed(1)}%</span>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="mt-6 space-y-8">
      {/* Growth Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
            <dd className="mt-1">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(growthStats.users.current)}
                </div>
                {formatTrend(growthStats.users)}
              </div>
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">API Calls</dt>
            <dd className="mt-1">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(growthStats.api.current)}
                </div>
                {formatTrend(growthStats.api)}
              </div>
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Storage Used</dt>
            <dd className="mt-1">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatNumber(growthStats.storage.current)} GB
                </div>
                {formatTrend(growthStats.storage)}
              </div>
            </dd>
          </div>
        </div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Active Users Trend */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-gray-900">Active Users Growth</h4>
            <div className="mt-4">
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {metrics.activeUsers.map((point, index) => {
                    const maxValue = Math.max(...metrics.activeUsers.map(p => p.count))
                    const height = `${(point.count / maxValue) * 100}%`
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-blue-100 rounded-t relative group"
                        style={{ height }}
                      >
                        <div className="w-full h-full bg-blue-500 opacity-75 rounded-t" />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                          {point.count} users
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-7 text-xs text-gray-500">
                {metrics.activeUsers.map((point, index) => (
                  <div key={index} className="text-center">
                    {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Usage Trend */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h4 className="text-base font-medium text-gray-900">API Usage Growth</h4>
            <div className="mt-4">
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {metrics.apiUsage.map((point, index) => {
                    const maxValue = Math.max(...metrics.apiUsage.map(p => p.count))
                    const height = `${(point.count / maxValue) * 100}%`
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 bg-green-100 rounded-t relative group"
                        style={{ height }}
                      >
                        <div className="w-full h-full bg-green-500 opacity-75 rounded-t" />
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                          {formatNumber(point.count)} calls
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-7 text-xs text-gray-500">
                {metrics.apiUsage.map((point, index) => (
                  <div key={index} className="text-center">
                    {new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Milestones */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-base font-medium text-gray-900">Growth Milestones</h4>
          <div className="mt-4">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {[
                  {
                    title: 'User Growth',
                    metric: growthStats.users.growth,
                    description: growthStats.users.growth > 0 
                      ? 'Steady user acquisition trend'
                      : 'User retention needs attention'
                  },
                  {
                    title: 'API Usage',
                    metric: growthStats.api.growth,
                    description: growthStats.api.growth > 0
                      ? 'Increasing platform engagement'
                      : 'API utilization could be improved'
                  },
                  {
                    title: 'Storage Growth',
                    metric: growthStats.storage.growth,
                    description: growthStats.storage.growth > 0
                      ? 'Data storage expanding steadily'
                      : 'Storage optimization recommended'
                  }
                ].map((milestone, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== 2 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            milestone.metric > 0 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}>
                            {milestone.metric > 0 ? (
                              <TrendingUp className="h-5 w-5 text-white" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {milestone.title}
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {milestone.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                          {Math.abs(milestone.metric).toFixed(1)}% {milestone.metric > 0 ? 'increase' : 'decrease'}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}