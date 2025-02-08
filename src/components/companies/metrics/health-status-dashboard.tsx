"use client"

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle, Clock, Activity, Users, Timer, ArrowUp } from 'lucide-react'
import { health_status } from '@prisma/client'
import { LineChart } from '@/components/dashboard/line-chart'

interface HealthMetrics {
  current: {
    status: health_status
    uptime: number
    errorRate: number
    responseTime: number
    activeUsers: number
    criticalIssues: number
    lastUpdated: Date | string
  }
  recentActivity: Array<{
    id: string
    type: 'error' | 'warning' | 'info' | 'success'
    title: string
    description: string
    timestamp: Date | string
    details?: {
      [key: string]: string | number
    }
  }>
  dailyMetrics: Array<{
    date: Date | string
    errorRate: number
    responseTime: number
    totalRequests: number
  }>
}

interface Props {
  metrics: HealthMetrics
}

export function HealthStatusDashboard({ metrics }: Props) {
  const healthStatus = useMemo(() => {
    // Critical if error rate > 5% or critical issues exist
    if (metrics.current.criticalIssues > 0 || metrics.current.errorRate > 5) {
      return 'critical'
    }
    // Warning if error rate > 1% or response time > 1000ms
    if (metrics.current.errorRate > 1 || metrics.current.responseTime > 1000) {
      return 'warning'
    }
    return 'healthy'
  }, [metrics])

  const statusConfig = {
    healthy: {
      color: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-400',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      title: 'System Healthy'
    },
    warning: {
      color: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-400',
      icon: <Clock className="h-8 w-8 text-yellow-500" />,
      title: 'System Warning'
    },
    critical: {
      color: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-400',
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      title: 'System Critical'
    }
  }

  const currentStatus = statusConfig[healthStatus]

  const kpiCards = [
    {
      title: 'Error Rate',
      value: `${metrics.current.errorRate.toFixed(2)}%`,
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      description: 'Last hour',
      trend: metrics.current.errorRate > 1 ? 'up' : 'down'
    },
    {
      title: 'Response Time',
      value: `${metrics.current.responseTime.toFixed(2)}ms`,
      icon: <Timer className="h-6 w-6 text-blue-500" />,
      description: 'Average',
      trend: metrics.current.responseTime > 500 ? 'up' : 'down'
    },
    {
      title: 'Uptime',
      value: `${metrics.current.uptime.toFixed(2)}%`,
      icon: <ArrowUp className="h-6 w-6 text-green-500" />,
      description: 'Last 30 days',
      trend: 'up'
    },
    {
      title: 'Active Users',
      value: metrics.current.activeUsers.toString(),
      icon: <Users className="h-6 w-6 text-purple-500" />,
      description: 'Current',
      trend: 'up'
    }
  ]

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    const seconds = d.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // Prepare data for line charts
  const errorRateChartData = {
    labels: metrics.dailyMetrics.map(m => new Date(m.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Error Rate',
        data: metrics.dailyMetrics.map(m => m.errorRate),
        fill: false,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.1
      }
    ]
  }

  const responseTimeChartData = {
    labels: metrics.dailyMetrics.map(m => new Date(m.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Response Time',
        data: metrics.dailyMetrics.map(m => m.responseTime),
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  }

  return (
    <div className="space-y-8">
      {/* System Status Banner */}
      <div className={`p-6 ${currentStatus.color} border-l-4 ${currentStatus.borderColor} rounded-lg`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {currentStatus.icon}
          </div>
          <div className="ml-4">
            <h3 className={`text-lg font-semibold ${currentStatus.textColor}`}>
              {currentStatus.title}
            </h3>
            <div className="mt-1">
              {metrics.current.criticalIssues > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 mr-2">
                  {metrics.current.criticalIssues} Critical Issues
                </span>
              )}
              <span className={`text-sm ${currentStatus.textColor}`}>
                Last updated: {formatTime(metrics.current.lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {card.icon}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                    <p className="ml-2 text-sm text-gray-500">{card.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart title="Error Rate Trend" data={errorRateChartData} />
        <LineChart title="Response Time Trend" data={responseTimeChartData} />
      </div>
    </div>
  )
}