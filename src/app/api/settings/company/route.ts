import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AuthService } from "@/lib/auth-service"
import { headers } from "next/headers"

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')
    const userAgent = headersList.get('user-agent')

    const {
      password_history_limit,
      password_expiry_days,
      max_failed_attempts,
      session_timeout_mins,
      enforce_single_session,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      smtp_from_email,
      smtp_from_name,
      password_expiry_notification_days,
      notification_preference
    } = await req.json()

    // Update company configuration
    const updatedConfig = await prisma.company_config.update({
      where: {
        company_id: session.user.companyId
      },
      data: {
        password_history_limit,
        password_expiry_days,
        max_failed_attempts,
        session_timeout_mins,
        enforce_single_session,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_password,
        smtp_from_email,
        smtp_from_name,
        password_expiry_notification_days,
        notification_preference
      }
    })

    // Log the settings change
    await AuthService.logAudit({
      userId: session.user.id,
      companyId: session.user.companyId,
      action: 'settings_change',
      details: 'Company settings updated',
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const config = await prisma.company_config.findUnique({
      where: {
        company_id: session.user.companyId
      }
    })

    if (!config) {
      return NextResponse.json({ error: "Configuration not found" }, { status: 404 })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 }
    )
  }
}