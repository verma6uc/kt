import { health_status, api_method, metric_type } from '@prisma/client'

export interface CompanyHealth {
  id: number
  company_id: number
  status: health_status
  uptime_percentage: number
  error_rate: number
  avg_response_time: number
  active_users: number
  critical_issues: number
  last_check: Date
  created_at: Date
}

export interface SystemMetrics {
  id: number
  company_id: number
  metric_type: metric_type
  value: number
  unit: string
  created_at: Date
}

export interface ApiMetrics {
  id: number
  company_id: number
  endpoint: string
  method: api_method
  status_code: number
  duration_ms: number
  created_at: Date
}

export interface UserActivity {
  id: number
  user_id: number
  company_id: number
  date: Date
  session_count: number
  created_at: Date
}

export interface FeatureUsage {
  id: number
  company_id: number
  feature_name: string
  usage_count: number
  created_at: Date
}

export interface GrowthMetrics {
  id: number
  company_id: number
  active_users: number
  total_storage: number
  api_calls: number
  created_at: Date
}

export interface ErrorLogs {
  id: number
  company_id: number
  error_type: string
  error_message: string
  stack_trace?: string
  date: Date
  count: number
  created_at: Date
}

export interface MetricsResponse {
  company: {
    id: number
    name: string
    identifier: string
  }
  metrics: {
    health: {
      current: {
        status: health_status
        uptime: number
        errorRate: number
        responseTime: number
        activeUsers: number
        criticalIssues: number
        lastUpdated: Date
      }
      recentActivity: Array<{
        id: string
        type: 'error' | 'warning' | 'info' | 'success'
        title: string
        description: string
        timestamp: Date
        details?: {
          [key: string]: string | number
        }
      }>
      dailyMetrics: Array<{
        date: Date
        errorRate: number
        responseTime: number
        totalRequests: number
      }>
    }
    api: {
      overview: {
        totalCalls: number
        successfulCalls: number
        errorCalls: number
        successRate: number
        errorRate: number
      }
      endpoints: Array<{
        endpoint: string
        method: api_method
        totalCalls: number
        avgResponseTime: number
        avgResponseSize: number
        maxResponseTime: number
        minResponseTime: number
      }>
      statusCodes: Array<{
        code: number
        count: number
      }>
      timeline: Array<{
        timestamp: Date
        responseTime: number
        statusCode: number
      }>
    }
    usage?: {
      patterns: {
        dailyActiveUsers: Array<{
          date: Date
          count: number
        }>
        featureUsage: Array<{
          name: string
          count: number
          date: Date
        }>
      }
      systemMetrics: Array<{
        metric_type: metric_type
        value: number
        unit: string
        created_at: Date
      }>
      apiMetrics: Array<{
        endpoint: string
        method: api_method
        status_code: number
        duration_ms: number
        created_at: Date
      }>
    }
    growth?: {
      trends: Array<{
        date: Date
        activeUsers: number
        storage: number
        apiCalls: number
      }>
    }
  }
}