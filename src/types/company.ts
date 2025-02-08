import { company_type, company_status } from '@prisma/client'
import { CompanyHealth } from './metrics'

export interface Company {
  id: number
  uuid: string
  name: string
  identifier: string
  description: string | null
  logo_url: string | null
  website: string | null
  type: company_type
  industry: string | null
  status: company_status
  tax_id: string | null
  registration_number: string | null
  employee_count: number | null
  created_at: Date
  updated_at: Date
  _count?: {
    user: number
    api_metrics?: number
    system_metrics?: number
  }
  user?: Array<{
    email: string
    name: string | null
  }>
  company_health?: CompanyHealth[]
  api_metrics?: Array<{
    id: number
    endpoint: string
    method: string
    status_code: number
    response_time: number
    created_at: Date
  }>
}