import { recordApiMetric, calculateRequestSize, calculateResponseSize } from './metrics-service'

export async function recordMetrics(config: any, response: any, error?: any) {
  try {
    const metrics = config._metrics || {}
    const duration = Date.now() - (metrics.startTime || 0)
    const responseData = error ? error.response?.data : response.data
    const responseSize = responseData ? calculateResponseSize(responseData) : 0
    const status = error ? error.response?.status || 500 : response?.status

    // Get user info from headers
    const headers = error ? error.response?.headers : response?.headers
    const userId = headers?.['x-user-id']
    const companyId = headers?.['x-company-id']

    await recordApiMetric({
      endpoint: config.url || '',
      method: (config.method?.toUpperCase() || 'GET') as any,
      statusCode: status,
      durationMs: duration,
      userId: userId ? parseInt(userId) : undefined,
      companyId: companyId ? parseInt(companyId) : undefined,
      ipAddress: headers?.['x-real-ip'] as string,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      responseSize,
      requestSize: metrics.requestSize,
      errorMessage: error?.message
    })
  } catch (metricError) {
    console.error('Error recording API metrics:', metricError)
  }
}