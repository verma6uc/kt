# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-02-08

### Added
- Enhanced company deactivation workflow:
  - Automatically suspends all company users
  - Immediately terminates all active user sessions
  - Sends email notifications to company admins
  - Creates detailed audit logs for deactivation and user suspensions
  - Forces immediate logout of all company users
- CSV export functionality for companies:
  - Added export button next to "Add Company"
  - Exports all company data in CSV format
  - Includes formatted dates and proper column headers
  - Downloads automatically with date-stamped filename
- Created date column to companies table:
  - Shows formatted date in "MMM D, YYYY" format
  - Default sorting by created date (newest first)
  - Sortable column header for flexible ordering

### Fixed
- Standardized pagination across the application:
  - Updated companies table to use the shared pagination component
  - Centered pagination and results count
  - Matched table container styling with notifications page
  - Aligned table header styles for consistent look and feel
  - Added proper shadow and border styling to match notifications table
- Standardized company modals styling:
  - Added blue icon header to edit modal
  - Updated form input styles with consistent icons and colors
  - Matched button styles and layout between create and edit modals
  - Unified font weights and spacing
- Standardized blue color scheme across the application:
  - Updated all buttons to use blue instead of indigo
  - Changed loading spinners to blue
  - Updated action menu hover states to blue
  - Made multiselect dropdown icons and states consistent with blue theme

### Improved
- Enhanced company creation modal:
  - Added icon prefix for company name input
  - Improved form field validation feedback
  - Added loading state for submission
- Enhanced company status management:
  - Added proper error handling for status changes
  - Improved feedback for successful/failed operations
  - Added transaction support for atomic operations
  - Added session cleanup for deactivated companies

### Security
- Enhanced session management:
  - Automatic session termination on company deactivation
  - Proper cleanup of all user sessions
  - Audit logging of session terminations
  - Immediate effect on all logged-in users