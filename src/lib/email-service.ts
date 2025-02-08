import nodemailer from 'nodemailer'

interface InvitationEmailParams {
  to: string
  name: string
  companyName: string
  token: string
  expiresAt: Date
}

export async function sendInvitationEmail({
  to,
  name,
  companyName,
  token,
  expiresAt
}: InvitationEmailParams) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${token}`
  const expirationDate = expiresAt.toLocaleDateString()

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to ${companyName}!</h2>
      <p>Hello ${name},</p>
      <p>You have been invited to join ${companyName} as a Company Administrator.</p>
      <p>To accept this invitation and set up your account, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      <p>This invitation link will expire on ${expirationDate}.</p>
      <p>If you did not expect this invitation, please ignore this email.</p>
      <p>Best regards,<br>The ${companyName} Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `

  await transporter.sendMail({
    from: `"${companyName}" <${process.env.SMTP_FROM}>`,
    to,
    subject: `Invitation to join ${companyName} as Company Administrator`,
    html
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password.</p>
      <p>To reset your password, please click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Support Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `

  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Password Reset Request',
    html
  })
}