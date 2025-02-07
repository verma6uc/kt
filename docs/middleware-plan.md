# API Metrics Collection Middleware Plan

## Overview
The API metrics collection system will track all API requests and responses to build a comprehensive view of system performance, usage patterns, and potential issues. This data will be used for monitoring, alerting, and optimization.

## Core Functionality

### 1. Request Tracking
```typescript
interface APIMetric {
  // Request Information
  endpoint: string          // API endpoint path
  method: string           // HTTP method
  startTime: number        // Request start timestamp
  endTime: number         // Request end timestamp
  duration: number        // Time taken in milliseconds
  
  // Response Information
  statusCode: number      // HTTP status code
  responseSize: number    // Size of response in bytes
  
  // Error Information
  errorMessage?: string   // Error message if any
  errorStack?: string     // Error stack trace if any
  
  // Context Information
  userId?: number         // User making the request
  companyId?: number      // Company context
  ipAddress: string       // Client IP address
  userAgent: string       // Client user agent
  
  // Request Details
  requestBody?: any       // Request payload
  queryParams?: any       // URL query parameters
  headers: Record<string, string> // Relevant headers
  
  // Performance Metrics
  memoryUsage: number     // Memory usage during request
  cpuUsage: number        // CPU usage during request
}
```

### 2. Implementation Strategy

#### a. Request Pipeline
```typescript
export async function metricsMiddleware(
  req: NextRequest,
  res: NextResponse
) {
  const startTime = performance.now()
  const metric: Partial<APIMetric> = {
    endpoint: req.url,
    method: req.method,
    startTime,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    headers: filterSensitiveHeaders(req.headers)
  }

  try {
    // Get user context if available
    const session = await getServerSession()
    if (session?.user) {
      metric.userId = parseInt(session.user.id)
      metric.companyId = parseInt(session.user.company.id)
    }

    // Capture request body for non-GET requests
    if (req.method !== 'GET') {
      metric.requestBody = await req.json()
    }

    // Capture query parameters
    metric.queryParams = Object.fromEntries(req.nextUrl.searchParams)

    // Start performance monitoring
    const startUsage = process.cpuUsage()
    const startMemory = process.memoryUsage()

    // Process request
    const response = await handler(req)

    // Calculate performance metrics
    const endTime = performance.now()
    const cpuUsage = process.cpuUsage(startUsage)
    const endMemory = process.memoryUsage()

    // Complete metric data
    metric.endTime = endTime
    metric.duration = endTime - startTime
    metric.statusCode = response.status
    metric.responseSize = parseInt(response.headers.get('content-length') || '0')
    metric.cpuUsage = cpuUsage.user + cpuUsage.system
    metric.memoryUsage = endMemory.heapUsed - startMemory.heapUsed

    return response
  } catch (error) {
    // Capture error information
    metric.errorMessage = error.message
    metric.errorStack = error.stack
    metric.statusCode = error.statusCode || 500

    throw error
  } finally {
    // Store metric asynchronously
    storeMetric(metric as APIMetric).catch(console.error)
  }
}
```

#### b. Metric Storage
```typescript
async function storeMetric(metric: APIMetric) {
  // Store in database
  await prisma.api_metrics.create({
    data: {
      endpoint: metric.endpoint,
      method: metric.method,
      status_code: metric.statusCode,
      duration_ms: Math.round(metric.duration),
      user_id: metric.userId,
      company_id: metric.companyId,
      ip_address: metric.ipAddress,
      user_agent: metric.userAgent,
      request_body: metric.requestBody,
      response_size: metric.responseSize,
      error_message: metric.errorMessage,
      metadata: {
        cpu_usage: metric.cpuUsage,
        memory_usage: metric.memoryUsage,
        headers: metric.headers,
        query_params: metric.queryParams
      }
    }
  })

  // Update real-time metrics
  await updateRealTimeMetrics(metric)
}
```

### 3. Real-time Monitoring

```typescript
async function updateRealTimeMetrics(metric: APIMetric) {
  const key = `metrics:realtime:${metric.endpoint}`
  
  // Update rolling window statistics
  await redis.multi()
    // Add to time series
    .zadd(
      `${key}:timeseries`,
      metric.startTime,
      JSON.stringify(metric)
    )
    // Update average response time
    .zadd(
      `${key}:response_times`,
      metric.duration,
      Date.now()
    )
    // Track error rates
    .hincrby(
      `${key}:errors`,
      metric.statusCode.toString(),
      1
    )
    .exec()

  // Trigger alerts if thresholds exceeded
  await checkAlertThresholds(metric)
}
```

### 4. Alert System

```typescript
async function checkAlertThresholds(metric: APIMetric) {
  if (!metric.companyId) return

  const config = await prisma.company_config.findUnique({
    where: { company_id: metric.companyId }
  })

  if (!config?.alert_thresholds) return

  const thresholds = config.alert_thresholds
  const alerts = []

  // Check response time threshold
  if (metric.duration > thresholds.response_time_ms) {
    alerts.push({
      type: 'response_time',
      message: `High response time detected: ${metric.duration}ms`,
      severity: 'warning'
    })
  }

  // Check error rate threshold
  const errorRate = await calculateErrorRate(metric.endpoint)
  if (errorRate > thresholds.error_rate_percent) {
    alerts.push({
      type: 'error_rate',
      message: `High error rate detected: ${errorRate}%`,
      severity: 'critical'
    })
  }

  // Send alerts
  for (const alert of alerts) {
    await sendAlert(metric.companyId, alert)
  }
}
```

## Data Retention & Aggregation

### 1. Retention Policy
- Raw metrics: 30 days
- Hourly aggregates: 90 days
- Daily aggregates: 1 year
- Monthly aggregates: 5 years

### 2. Aggregation Jobs
```typescript
// Run hourly
async function aggregateHourlyMetrics() {
  const hour = new Date()
  hour.setMinutes(0, 0, 0)

  await prisma.$transaction([
    // Aggregate API metrics
    prisma.api_metrics_hourly.create({
      data: await calculateHourlyMetrics(hour)
    }),
    // Cleanup raw metrics older than 30 days
    prisma.api_metrics.deleteMany({
      where: {
        created_at: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ])
}
```

## Implementation Phases

### Phase 1: Basic Metrics (Week 1)
- [ ] Set up database tables
- [ ] Implement basic middleware
- [ ] Add request/response tracking
- [ ] Basic error tracking

### Phase 2: Performance Metrics (Week 2)
- [ ] Add CPU/Memory tracking
- [ ] Implement real-time monitoring
- [ ] Set up data retention
- [ ] Basic aggregation

### Phase 3: Alerting (Week 3)
- [ ] Implement alert system
- [ ] Add threshold configuration
- [ ] Set up notification delivery
- [ ] Alert history tracking

### Phase 4: Advanced Features (Week 4)
- [ ] Advanced aggregations
- [ ] Trend analysis
- [ ] Performance predictions
- [ ] Custom metric tracking