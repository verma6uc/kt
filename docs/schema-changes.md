# Schema Changes for Yuvi Platform Enhancement

## New Enums to Add

```prisma
enum metric_type {
  cpu
  memory
  disk
  network
  api
  custom
}

enum health_status {
  healthy
  warning
  critical
}

enum api_method {
  GET
  POST
  PUT
  PATCH
  DELETE
}
```

## New Models to Add

### 1. API Metrics
```prisma
model api_metrics {
  id            Int       @id @default(autoincrement())
  uuid          String    @unique @default(uuid())
  endpoint      String    // API endpoint path
  method        api_method
  status_code   Int       // Response status code
  duration_ms   Int       // Time taken in milliseconds
  user_id       Int?      // Optional link to user who made the request
  company_id    Int?      // Optional link to company context
  ip_address    String?
  user_agent    String?
  request_body  Json?     // Request payload
  response_size Int?      // Size of response in bytes
  error_message String?   // If any error occurred
  created_at    DateTime  @default(now())
  
  user          user?     @relation(fields: [user_id], references: [id])
  company       company?  @relation(fields: [company_id], references: [id])

  @@index([endpoint])
  @@index([created_at])
  @@index([company_id])
  @@index([status_code])
}
```

### 2. System Metrics
```prisma
model system_metrics {
  id           Int         @id @default(autoincrement())
  uuid         String      @unique @default(uuid())
  metric_type  metric_type
  value        Float       // Metric value
  unit         String      // Unit of measurement (e.g., "MB", "ms", "%")
  company_id   Int?        // Optional company context
  created_at   DateTime    @default(now())
  
  company      company?    @relation(fields: [company_id], references: [id])

  @@index([metric_type, created_at])
  @@index([company_id])
}
```

### 3. Company Health
```prisma
model company_health {
  id                 Int           @id @default(autoincrement())
  uuid               String        @unique @default(uuid())
  company_id         Int
  status             health_status @default(healthy)
  error_rate         Float         // Current error rate percentage
  avg_response_time  Float         // Average response time in ms
  uptime_percentage  Float         // System uptime percentage
  active_users       Int           // Current active users
  resource_usage     Json          // Detailed resource usage metrics
  critical_issues    Int           // Number of current critical issues
  last_check         DateTime      @default(now())
  created_at         DateTime      @default(now())
  
  company            company       @relation(fields: [company_id], references: [id])

  @@index([company_id])
  @@index([created_at])
}
```

## Updates to Existing Models

### 1. Company Model
Add the following fields:
```prisma
model company {
  // ... existing fields ...
  
  // New fields to add
  health_check_enabled    Boolean   @default(true)
  health_check_interval   Int       @default(300) // seconds
  max_resource_quota     Json?     // Resource limits
  last_health_check      DateTime?
  
  // New relations to add
  company_health         company_health[]
  api_metrics           api_metrics[]
  system_metrics        system_metrics[]
}
```

### 2. Company Config Model
Add the following fields:
```prisma
model company_config {
  // ... existing fields ...
  
  // New fields to add
  monitoring_preferences Json?     // Monitoring settings
  alert_thresholds      Json?     // Alert threshold configurations
  notification_rules    Json?     // Notification rules for metrics
}
```

## Migration Steps

1. Add new enums
2. Create new tables for metrics and health monitoring
3. Add new fields to existing tables
4. Create indexes for performance
5. Update existing data if needed
6. Add foreign key constraints

## Considerations

### Performance
- Partitioning strategy for metrics tables
- Regular cleanup of old metrics data
- Efficient indexing for common queries

### Security
- Data isolation between companies
- Access control for metrics data
- Audit logging for sensitive operations

### Scalability
- Handle high volume of metrics data
- Efficient aggregation queries
- Background jobs for health checks

## Next Steps

1. Switch to Code mode to implement these changes
2. Create migration files
3. Update seed data
4. Implement background jobs for metrics collection
5. Add API endpoints for metrics and health data