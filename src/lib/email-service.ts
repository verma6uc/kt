import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

// Create reusable transporter object using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    // Log that we're attempting to send an email
    console.log('Attempting to send email:', {
      to,
      subject,
      from: process.env.SMTP_FROM
    })

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent successfully:', info.messageId)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}