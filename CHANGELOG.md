# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-02-08

### Changed
- Restricted company edit functionality for super admins:
  - Limited editable fields to company name, identifier, and logo
  - Added validation for identifier uniqueness
  - Enhanced audit logging for field changes
  - Updated UI to reflect limited editing capabilities
  - Improved form validation and error handling

### Added
- Sorting functionality to companies table:
  - Sort by company name, type, status, industry, and user count
  - Visual indicators for sort direction
  - Server-side sorting implementation
  - Persistent sort state

### Changed
- Simplified company creation process:
  - Reduced required fields to only company name and optional logo
  - Automated identifier generation
  - Moved additional company details to CompanyAdmin setup phase
  - Updated company creation API to handle simplified data
  - Improved validation and error handling

## [Unreleased] - 2025-02-07

### Added
- Admin invitation system
  - Invitation workflow and UI components
  - Email service integration
  - Documentation and schema changes
- Health metrics features
  - Health metrics API endpoints
  - Health metrics table component
  - Health status dashboard
- Audit system enhancements
  - Recent activity cards
  - Audit logging improvements
  - Type definitions for audit data
- User count in company list API response
- Extended Company type definitions

## [Initial Release] - 2025-02-07

### Added
- Next.js application setup with TypeScript and Tailwind CSS
- Authentication system with NextAuth
- Company management features
  - Company creation and editing
  - Logo upload functionality
  - Business information management
  - Contact information handling
  - Registration details
- Admin invitation system
- Notification system
  - Real-time notifications
  - Mark as read functionality
  - Notification filters
- Dashboard with analytics
  - Growth trends analysis
  - Health status dashboard
  - Platform usage analytics
- Audit logging system
- API endpoints for all major functionalities
- Responsive UI components
  - Dashboard layout
  - Navigation bar
  - Sidebar
  - Data tables
  - Charts
  - Forms
- Prisma ORM integration
- Email service integration
- Security features
  - Password change functionality
  - Protected routes
  - Authentication middleware