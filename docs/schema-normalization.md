# Database Normalization Improvements

## Current Normalization Issues

1. Contact Information is denormalized in company table
2. Address information is duplicated across entities
3. Configuration settings are not properly separated
4. Metrics data needs temporal aggregation
5. Metadata is stored as JSON in several places

## Proposed Normalized Structure

### 1. Address Management
```prisma
model address {
  id            Int       @id @default(autoincrement())
  uuid          String    @unique @default(uuid())
  street        String
  city          String
  state         String?
  country       String
  postal_code   String
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  companies     company_address[]
  users         user_address[]

  @@index([country, state, city])
}

model company_address {
  id            Int       @id @default(autoincrement())
  company_id    Int
  address_id    Int
  type          String    // HQ, Branch, Billing, etc.
  is_primary    Boolean   @default(false)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  company       company   @relation(fields: [company_id], references: [id])
  address       address   @relation(fields: [address_id], references: [id])

  @@unique([company_id, type, is_primary])
}

model user_address {
  id            Int       @id @default(autoincrement())
  user_id       Int
  address_id    Int
  type          String    // Home, Work, etc.
  is_primary    Boolean   @default(false)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  user          user      @relation(fields: [user_id], references: [id])
  address       address   @relation(fields: [address_id], references: [id])

  @@unique([user_id, type, is_primary])
}
```

### 2. Contact Information
```prisma
model contact_info {
  id            Int       @id @default(autoincrement())
  uuid          String    @unique @default(uuid())
  type          String    // Phone, Email, Fax, etc.
  value         String
  is_primary    Boolean   @default(false)
  verified      Boolean   @default(false)
  verified_at   DateTime?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  company_contacts company_contact[]
  user_contacts    user_contact[]

  @@index([type, value])
}

model company_contact {
  id              Int          @id @default(autoincrement())
  company_id      Int
  contact_info_id Int
  department      String?      // Sales, Support, etc.
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  company         company      @relation(fields: [company_id], references: [id])
  contact_info    contact_info @relation(fields: [contact_info_id], references: [id])

  @@unique([company_id, contact_info_id])
}

model user_contact {
  id              Int          @id @default(autoincrement())
  user_id         Int
  contact_info_id Int
  created_at      DateTime     @default(now())
  updated_at      DateTime     @updatedAt

  user            user         @relation(fields: [user_id], references: [id])
  contact_info    contact_info @relation(fields: [contact_info_id], references: [id])

  @@unique([user_id, contact_info_id])
}
```

### 3. Configuration Management
```prisma
model smtp_config {
  id              Int       @id @default(autoincrement())
  uuid            String    @unique @default(uuid())
  company_id      Int       @unique
  host            String
  port            Int
  username        String?
  password        String?
  from_email      String
  from_name       String
  encryption_type String    @default("TLS")
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  company         company   @relation(fields: [company_id], references: [id])
}

model security_config {
  id                      Int       @id @default(autoincrement())
  uuid                    String    @unique @default(uuid())
  company_id              Int       @unique
  password_history_limit  Int       @default(3)
  password_expiry_days    Int       @default(90)
  max_failed_attempts     Int       @default(5)
  session_timeout_mins    Int       @default(60)
  enforce_single_session  Boolean   @default(false)
  created_at             DateTime  @default(now())
  updated_at             DateTime  @updatedAt

  company                company   @relation(fields: [company_id], references: [id])
}

model notification_config {
  id                    Int               @id @default(autoincrement())
  uuid                  String            @unique @default(uuid())
  company_id            Int               @unique
  notification_type     notification_type @default(email)
  reminder_days         Int[]            @default([3, 7])
  alert_thresholds     Json?
  created_at           DateTime          @default(now())
  updated_at           DateTime          @updatedAt

  company              company           @relation(fields: [company_id], references: [id])
}
```

### 4. Metrics Aggregation
```prisma
model metrics_hourly {
  id            Int       @id @default(autoincrement())
  company_id    Int
  metric_type   String
  hour          DateTime
  min_value     Float
  max_value     Float
  avg_value     Float
  count         Int
  created_at    DateTime  @default(now())

  company       company   @relation(fields: [company_id], references: [id])

  @@unique([company_id, metric_type, hour])
  @@index([hour])
}

model metrics_daily {
  id            Int       @id @default(autoincrement())
  company_id    Int
  metric_type   String
  date          DateTime
  min_value     Float
  max_value     Float
  avg_value     Float
  count         Int
  created_at    DateTime  @default(now())

  company       company   @relation(fields: [company_id], references: [id])

  @@unique([company_id, metric_type, date])
  @@index([date])
}

model metrics_monthly {
  id            Int       @id @default(autoincrement())
  company_id    Int
  metric_type   String
  month         DateTime
  min_value     Float
  max_value     Float
  avg_value     Float
  count         Int
  created_at    DateTime  @default(now())

  company       company   @relation(fields: [company_id], references: [id])

  @@unique([company_id, metric_type, month])
  @@index([month])
}
```

## Benefits of This Normalization

1. **Reduced Data Redundancy**
   - Address information stored once and referenced
   - Contact information centralized
   - Configuration settings properly separated

2. **Better Data Integrity**
   - Proper foreign key relationships
   - Clear ownership of data
   - Easier to maintain consistency

3. **Improved Query Performance**
   - Efficient indexing possible
   - Smaller table sizes
   - Better query optimization opportunities

4. **Enhanced Flexibility**
   - Easy to add new types of contacts
   - Simple to extend address types
   - Configurable settings isolated

5. **Better Maintenance**
   - Easier to update single pieces of information
   - Clearer audit trail
   - Simplified backup and restore

## Migration Considerations

1. **Data Migration**
   - Need to carefully migrate existing data
   - Maintain data integrity during migration
   - Consider downtime requirements

2. **Application Updates**
   - Update all queries to use new schema
   - Modify API endpoints
   - Update frontend forms

3. **Performance Impact**
   - More joins required
   - Need for proper indexing
   - Consider caching strategies

## Next Steps

1. Create migration scripts
2. Update application code
3. Test with sample data
4. Plan production deployment
5. Monitor performance impact