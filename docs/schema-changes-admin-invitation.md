# Schema Changes for Admin Invitation System

## New Models

### AdminInvitation Model
```prisma
model AdminInvitation {
  id            Int       @id @default(autoincrement())
  company_id    Int
  email         String
  name          String
  token         String    @unique
  expires_at    DateTime
  status        String    @default("pending") // pending, accepted, cancelled, expired
  created_at    DateTime  @default(now())
  created_by    Int
  updated_at    DateTime? @updatedAt
  updated_by    Int?

  // Relations
  company       Company   @relation(fields: [company_id], references: [id])
  creator       User      @relation("InvitationCreator", fields: [created_by], references: [id])
  updater       User?     @relation("InvitationUpdater", fields: [updated_by], references: [id])

  @@map("admin_invitations")
  @@index([company_id])
  @@index([email])
  @@index([token])
  @@index([status])
}
```

### Updates to User Model
```prisma
model User {
  // ... existing fields ...

  // New relations
  created_invitations AdminInvitation[] @relation("InvitationCreator")
  updated_invitations AdminInvitation[] @relation("InvitationUpdater")
}
```

### Updates to Company Model
```prisma
model Company {
  // ... existing fields ...

  // New relations
  admin_invitations AdminInvitation[]
}
```

## Migration Steps

1. Create admin_invitations table
2. Add indexes for performance optimization
3. Update User model to include invitation relations
4. Update Company model to include invitation relations

## Enums and Constants

```prisma
enum InvitationStatus {
  PENDING
  ACCEPTED
  CANCELLED
  EXPIRED
}
```

## Security Considerations

1. Token Generation
   - Use crypto.randomBytes for secure token generation
   - Hash tokens before storing in database
   - Set appropriate token length (at least 32 bytes)

2. Expiration
   - Default expiration time: 7 days
   - Store expiration in UTC
   - Regular cleanup of expired invitations

3. Email Uniqueness
   - Case-insensitive email comparison
   - Check across all user accounts
   - Prevent duplicate active invitations

## Audit Trail

The following events should be logged in the audit system:

1. Invitation Creation
   ```json
   {
     "action": "ADMIN_INVITATION_CREATED",
     "company_id": "number",
     "invitation_id": "number",
     "actor_id": "number",
     "target_email": "string",
     "metadata": {
       "expires_at": "datetime"
     }
   }
   ```

2. Invitation Resend
   ```json
   {
     "action": "ADMIN_INVITATION_RESENT",
     "company_id": "number",
     "invitation_id": "number",
     "actor_id": "number",
     "target_email": "string",
     "metadata": {
       "previous_token_invalidated": "boolean",
       "new_expiration": "datetime"
     }
   }
   ```

3. Invitation Cancellation
   ```json
   {
     "action": "ADMIN_INVITATION_CANCELLED",
     "company_id": "number",
     "invitation_id": "number",
     "actor_id": "number",
     "target_email": "string",
     "metadata": {
       "reason": "string"
     }
   }
   ```

4. Invitation Acceptance
   ```json
   {
     "action": "ADMIN_INVITATION_ACCEPTED",
     "company_id": "number",
     "invitation_id": "number",
     "actor_id": "number",
     "target_email": "string",
     "metadata": {
       "new_user_id": "number"
     }
   }
   ```

## Database Indexes

The following indexes will be created for optimal query performance:

1. Primary Index
   - admin_invitations(id)

2. Foreign Key Indexes
   - admin_invitations(company_id)
   - admin_invitations(created_by)
   - admin_invitations(updated_by)

3. Search Indexes
   - admin_invitations(email)
   - admin_invitations(token)
   - admin_invitations(status)

4. Compound Indexes
   - admin_invitations(company_id, status)
   - admin_invitations(email, status)

## Next Steps

1. Create Prisma migration
2. Update API endpoints to use new schema
3. Implement token generation and validation
4. Add email templates for invitations
5. Create UI components for invitation management