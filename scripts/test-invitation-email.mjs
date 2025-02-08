import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { config } from 'dotenv'
import nodemailer from 'nodemailer'

// Setup environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../.env') })

// Create reusable transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function generateInvitationEmailTemplate(params) {
  const { companyName, invitationLink, expiryDays } = params

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Invitation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: #3b82f6;
          color: white;
          padding: 24px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 32px 24px;
          background: white;
        }
        .message {
          color: #374151;
          font-size: 16px;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          margin: 16px 0;
          text-align: center;
        }
        .button:hover {
          background: #2563eb;
        }
        .footer {
          padding: 24px;
          background: #f8fafc;
          text-align: center;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
        }
        .note {
          font-size: 14px;
          color: #64748b;
          margin-top: 16px;
        }
        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 24px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Admin Invitation</h1>
        </div>
        <div class="content">
          <div class="message">
            <p>Hello,</p>
            <p>You have been invited to be a Company Admin for <strong>${companyName}</strong>.</p>
            <p>As a Company Admin, you'll have access to:</p>
            <ul>
              <li>Company dashboard and analytics</li>
              <li>User management tools</li>
              <li>System configuration settings</li>
              <li>Performance monitoring features</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          <div class="note">
            <p>This invitation will expire in ${expiryDays} days. For security reasons, please do not forward this email to anyone.</p>
          </div>
          <div class="divider"></div>
          <div class="note">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${invitationLink}</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function testInvitationEmail() {
  try {
    const testParams = {
      companyName: 'Test Company Inc.',
      invitationLink: 'http://localhost:3001/accept-invitation?token=test-token-123',
      expiryDays: 7
    }

    const emailHtml = generateInvitationEmailTemplate(testParams)

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'vaibhav.verma@gmail.com', // Replace with your test email
      subject: `Company Admin Invitation - ${testParams.companyName}`,
      text: `
        You have been invited to be a Company Admin for ${testParams.companyName}.
        
        Click the link below to accept the invitation and set up your account:
        ${testParams.invitationLink}
        
        This invitation will expire in ${testParams.expiryDays} days.
      `,
      html: emailHtml
    })

    console.log('Test email sent successfully!')
    console.log('Message ID:', info.messageId)
  } catch (error) {
    console.error('Error sending test email:', error)
  }
}

// Run the test
testInvitationEmail()