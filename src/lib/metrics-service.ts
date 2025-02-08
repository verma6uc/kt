import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'
import type { api_method } from '@prisma/client'

interface ApiMetricData {
  endpoint: string
  method: api_method
  statusCode: number
  durationMs: number
  userId?: number
  companyId?: number
  ipAddress?: string
  userAgent?: string
  responseSize?: number
  errorMessage?: string
  requestSize?: number
}

export async function recordApiMetric(data: ApiMetricData) {
  try {
    await prisma.api_metrics.create({
      data: {
        uuid: uuidv4(),
        endpoint: data.endpoint,
        method: data.method,
        status_code: data.statusCode,
        duration_ms: data.durationMs,
        user_id: data.userId,
        company_id: data.companyId,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        response_size: data.responseSize,
        error_message: data.errorMessage,
        request_size: data.requestSize
      }
    })
  } catch (error) {
    // Log error but don't throw - we don't want metrics recording to affect the main application
    console.error('Error recording API metric:', error)
  }
}

export function calculateResponseSize(data: unknown): number {
  try {
    if (!data) return 0
    return new TextEncoder().encode(JSON.stringify(data)).length
  } catch {
    return 0
  }
}

export function calculateRequestSize(data: unknown): number {
  try {
    if (!data) return 0
    return new TextEncoder().encode(JSON.stringify(data)).length
  } catch {
    return 0
  }
}