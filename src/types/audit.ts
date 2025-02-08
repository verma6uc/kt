export interface AuditLog {
  id: number
  uuid: string
  action: string
  details: string
  created_at: string
  ip_address: string | null
  user_agent: string | null
  user: {
    id: number
    name: string | null
    email: string
  }
  company: {
    id: number
    name: string
    identifier: string
  }
}