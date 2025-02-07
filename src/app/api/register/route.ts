import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { AuthService } from "@/lib/auth-service"

export async function POST(req: Request) {
  try {
    const { 
      email, 
      password, 
      name, 
      companyName,
      phone,
      address,
      website,
      industry
    } = await req.json()

    // Get request headers
    const ipAddress = req.headers.get('x-forwarded-for')
    const userAgent = req.headers.get('user-agent')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Create company first
    const company = await prisma.company.create({
      data: {
        name: companyName,
        identifier: companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        website,
        industry,
        type: 'small_business',
        status: 'active',
        setup_completed_at: new Date(),
        health_check_enabled: true,
        health_check_interval: 300
      }
    })

    // Create company address if provided
    if (address) {
      const companyAddress = await prisma.address.create({
        data: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          postal_code: address.postalCode
        }
      })

      await prisma.company_address.create({
        data: {
          company_id: company.id,
          address_id: companyAddress.id,
          type: 'HQ',
          is_primary: true
        }
      })
    }

    // Create company contact info
    if (email) {
      const emailContact = await prisma.contact_info.create({
        data: {
          type: 'email',
          value: email,
          is_primary: true,
          verified: true,
          verified_at: new Date()
        }
      })

      await prisma.company_contact.create({
        data: {
          company_id: company.id,
          contact_info_id: emailContact.id,
          department: 'Main'
        }
      })
    }

    if (phone) {
      const phoneContact = await prisma.contact_info.create({
        data: {
          type: 'phone',
          value: phone,
          is_primary: true,
          verified: false
        }
      })

      await prisma.company_contact.create({
        data: {
          company_id: company.id,
          contact_info_id: phoneContact.id,
          department: 'Main'
        }
      })
    }

    // Create default company configurations
    await prisma.smtp_config.create({
      data: {
        company_id: company.id,
        host: 'smtp.company.com',
        port: 587,
        from_email: `no-reply@${company.identifier}.com`,
        from_name: company.name
      }
    })

    await prisma.security_config.create({
      data: {
        company_id: company.id,
        // Default values are set in the schema
      }
    })

    await prisma.notification_config.create({
      data: {
        company_id: company.id,
        notification_type: 'email'
      }
    })

    // Create reminder schedules
    await prisma.reminder_schedule.create({
      data: {
        company_id: company.id,
        days_before: 7
      }
    })

    await prisma.reminder_schedule.create({
      data: {
        company_id: company.id,
        days_before: 3
      }
    })

    // Create default alert thresholds
    const defaultThresholds = [
      { name: 'error_rate', warning: 5, critical: 10 },
      { name: 'response_time', warning: 1000, critical: 2000 },
      { name: 'cpu_usage', warning: 80, critical: 90 },
      { name: 'memory_usage', warning: 80, critical: 90 }
    ]

    for (const threshold of defaultThresholds) {
      await prisma.alert_threshold.create({
        data: {
          company_id: company.id,
          metric_name: threshold.name,
          warning: threshold.warning,
          critical: threshold.critical
        }
      })
    }

    // Create default resource quotas
    const defaultQuotas = [
      { resource: 'cpu', limit: 4, unit: 'cores' },
      { resource: 'memory', limit: 8, unit: 'GB' },
      { resource: 'storage', limit: 100, unit: 'GB' },
      { resource: 'bandwidth', limit: 1000, unit: 'GB/month' }
    ]

    for (const quota of defaultQuotas) {
      await prisma.resource_quota.create({
        data: {
          company_id: company.id,
          resource: quota.resource,
          limit: quota.limit,
          unit: quota.unit
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        company_id: company.id,
        role: 'company_admin',
        status: 'active',
        email_verified: new Date()
      }
    })

    // Create user contact info
    if (email) {
      const emailContact = await prisma.contact_info.create({
        data: {
          type: 'email',
          value: email,
          is_primary: true,
          verified: true,
          verified_at: new Date()
        }
      })

      await prisma.user_contact.create({
        data: {
          user_id: user.id,
          contact_info_id: emailContact.id
        }
      })
    }

    if (phone) {
      const phoneContact = await prisma.contact_info.create({
        data: {
          type: 'phone',
          value: phone,
          is_primary: true,
          verified: false
        }
      })

      await prisma.user_contact.create({
        data: {
          user_id: user.id,
          contact_info_id: phoneContact.id
        }
      })
    }

    // Add password to history
    await AuthService.addPasswordToHistory(
      user.id.toString(),
      company.id.toString(),
      hashedPassword
    )

    // Log the registration
    await AuthService.logAudit({
      userId: user.id.toString(),
      companyId: company.id.toString(),
      action: 'create',
      details: 'New user registration',
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id,
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}