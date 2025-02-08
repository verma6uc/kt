# Force Logout Implementation Plan

## Overview
When a company is deactivated, we need to force logout all users from that company. This will be achieved by invalidating their sessions and preventing them from making further requests until they log in again (which will be prevented if their account is suspended).

## Database Changes

### Add Session Invalidation Table
```prisma
model session_invalidation {
  id         Int      @id @default(autoincrement())
  user_id    Int
  company_id Int
  created_at DateTime @default(now())
  reason     String   @db.Text

  user    user    @relation(fields: [user_id], references: [id])
  company company @relation(fields: [company_id], references: [id])

  @@index([user_id])
  @@index([company_id])
  @@index([created_at])
}
```

## API Changes

### Add Force Logout Endpoint
Create a new API endpoint at `/api/auth/force-logout` that will:
- Accept user IDs or company ID to invalidate
- Create invalidation records
- Return success/failure status

### Update Auth Middleware
Modify the auth middleware to:
1. Check for session invalidations on every request
2. If an invalidation exists that's newer than the session:
   - Return 401 with a special code
   - Frontend will handle this by logging out the user
   - Clear local session data

## Implementation Steps

1. Database Migration
   - Create session_invalidation table
   - Add indexes for performance

2. Backend Changes
   - Create force logout service function
   - Add API endpoint for force logout
   - Update auth middleware
   - Add session invalidation to company deactivation workflow

3. Frontend Changes
   - Add global axios interceptor to handle force logout responses
   - Update auth provider to handle force logouts
   - Add force logout handling to protected routes
   - Show appropriate message to logged out users

4. Testing
   - Test individual force logout
   - Test company-wide force logout
   - Test session invalidation timing
   - Test concurrent requests handling

## Security Considerations

1. Rate Limiting
   - Add rate limiting to force logout endpoint
   - Prevent DoS attacks

2. Audit Logging
   - Log all force logout actions
   - Track who initiated the logout
   - Record the reason for the logout

3. Session Management
   - Ensure proper cleanup of old invalidation records
   - Handle edge cases with session timing

## Impact

### Positive Impact
- Immediate security response to company deactivation
- Better control over user access
- Clear audit trail of forced logouts

### Potential Risks
- Increased database load from session checks
- Possible race conditions in concurrent requests
- Need for careful cache invalidation

## Timeline
1. Database changes (1 hour)
2. Backend implementation (2-3 hours)
3. Frontend changes (2 hours)
4. Testing and refinement (2 hours)
5. Documentation (1 hour)

Total estimated time: 8-9 hours

## Next Steps
1. Review and approve this plan
2. Create database migration
3. Implement backend changes
4. Update frontend to handle force logouts
5. Test thoroughly
6. Deploy changes