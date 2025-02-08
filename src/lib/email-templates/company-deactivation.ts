export function getCompanyDeactivationEmailTemplate(companyName: string) {
  return {
    subject: `[Important] ${companyName} has been deactivated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a; margin-bottom: 20px;">Company Deactivation Notice</h2>
        
        <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          This is to inform you that <strong>${companyName}</strong> has been deactivated in the system.
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          As a result of this deactivation:
          <ul style="margin-top: 10px;">
            <li>All user accounts associated with ${companyName} have been suspended</li>
            <li>Access to company resources and services has been temporarily disabled</li>
            <li>Any ongoing processes or operations have been halted</li>
          </ul>
        </p>

        <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
          If you believe this has been done in error or have any questions, please contact the system administrator immediately.
        </p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 30px;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
    text: `
Company Deactivation Notice

This is to inform you that ${companyName} has been deactivated in the system.

As a result of this deactivation:
- All user accounts associated with ${companyName} have been suspended
- Access to company resources and services has been temporarily disabled
- Any ongoing processes or operations have been halted

If you believe this has been done in error or have any questions, please contact the system administrator immediately.

This is an automated message. Please do not reply to this email.
    `.trim()
  }
}