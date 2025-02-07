export interface Company {
  id: number
  name: string
  identifier: string
  type: 'small_business' | 'enterprise' | 'startup'
  status: 'pending_setup' | 'active' | 'suspended' | 'inactive'
  industry: string | null
  created_at: Date
  _count: {
    users: number
    api_metrics: number
    system_metrics: number
  }
  company_health: Array<{
    status: 'healthy' | 'warning' | 'critical'
    error_rate: number
    avg_response_time: number
    uptime_percentage: number
    active_users: number
    critical_issues: number
    last_check: Date
    created_at: Date
  }>
  api_metrics: Array<{
    endpoint: string
    method: string
    status_code: number
    duration_ms: number
    created_at: Date
  }>
  users: Array<{
    email: string
    name: string | null
  }>
}