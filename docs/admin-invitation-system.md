# Company Admin Invitation System

## Overview
This system allows Superadmins to invite Company Admins to manage their respective companies, with secure invitation handling and audit logging.

## Database Schema Changes

### Admin Invitation Table
```sql
CREATE TABLE admin_invitations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, accepted, cancelled, expired
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Add indexes for performance
CREATE INDEX idx_admin_invitations_company_id ON admin_invitations(company_id);
CREATE INDEX idx_admin_invitations_email ON admin_invitations(email);
CREATE INDEX idx_admin_invitations_token ON admin_invitations(invitation_token);
CREATE INDEX idx_admin_invitations_status ON admin_invitations(status);
```

## API Endpoints

### 1. Create Admin Invitation
- **Endpoint**: POST /api/companies/{companyId}/admin-invitation
- **Auth**: Requires Super Admin
- **Request Body**:
  ```typescript
  {
    email: string;
    name: string;
  }
  ```
- **Process**:
  1. Verify email is not associated with any existing account
  2. Generate secure invitation token
  3. Set expiration (e.g., 7 days)
  4. Create invitation record
  5. Send invitation email
  6. Create audit log entry

### 2. Resend Admin Invitation
- **Endpoint**: POST /api/companies/{companyId}/admin-invitation/{invitationId}/resend
- **Auth**: Requires Super Admin
- **Process**:
  1. Invalidate existing invitation token
  2. Generate new token and expiration
  3. Update invitation record
  4. Send new invitation email
  5. Create audit log entry

### 3. Cancel Admin Invitation
- **Endpoint**: POST /api/companies/{companyId}/admin-invitation/{invitationId}/cancel
- **Auth**: Requires Super Admin
- **Process**:
  1. Mark invitation as cancelled
  2. Invalidate invitation token
  3. Create audit log entry

### 4. Accept Invitation
- **Endpoint**: POST /api/admin-invitation/accept
- **Request Body**:
  ```typescript
  {
    token: string;
    password: string;
  }
  ```
- **Process**:
  1. Verify token is valid and not expired
  2. Create user account
  3. Assign CompanyAdmin role
  4. Mark invitation as accepted
  5. Create audit log entry

## Components

### 1. Admin Invitation Modal
- Form for entering admin email and name
- Email validation
- Success/error notifications
- Loading states

### 2. Admin Invitations Table
- List of pending/accepted invitations
- Actions: Resend, Cancel
- Status indicators
- Expiration countdown

## Email Templates

### 1. Initial Invitation Email
```html
Subject: You've been invited to manage {Company Name}

Dear {Admin Name},

You have been invited to manage {Company Name} on our platform. Click the link below to set up your account:

{Invitation Link}

This link will expire in 7 days.

Best regards,
{Platform Name} Team
```

### 2. Resend Invitation Email
```html
Subject: New invitation to manage {Company Name}

Dear {Admin Name},

A new invitation has been generated for you to manage {Company Name}. Click the link below to set up your account:

{Invitation Link}

This link will expire in 7 days. Any previous invitation links are no longer valid.

Best regards,
{Platform Name} Team
```

## Security Considerations

1. **Token Generation**
   - Use cryptographically secure random tokens
   - Include expiration timestamp in token
   - Hash tokens before storing

2. **Email Verification**
   - Case-insensitive email comparison
   - Validate email format
   - Check for disposable email domains

3. **Rate Limiting**
   - Limit invitation attempts per company
   - Limit resend attempts
   - Implement cooldown period

4. **Audit Logging**
   - Log all invitation-related actions
   - Include actor, action, timestamp
   - Track IP addresses

## Implementation Steps

1. **Database Setup**
   - Create admin_invitations table
   - Add necessary indexes
   - Update Prisma schema

2. **Backend Implementation**
   - Create API endpoints
   - Implement email service
   - Add validation middleware
   - Set up audit logging

3. **Frontend Implementation**
   - Create invitation modal
   - Add invitation management UI
   - Implement validation
   - Add loading states and error handling

4. **Testing**
   - Unit tests for validation
   - Integration tests for invitation flow
   - Email delivery testing
   - Security testing

5. **Deployment**
   - Database migration
   - Email template setup
   - Environment variable configuration
   - Documentation update