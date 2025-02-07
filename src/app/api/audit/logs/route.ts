import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface AuditLogUser {
  name: string | null
  email: string
  role: string
}

interface AuditLog {
  id: string
  user_id: string
  company_id: string
  action: string
  details: string
  ip_address: string | null
  user_agent: string | null
  created_at: Date
  user: AuditLogUser
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    // Build where clause
    const where = {
      company_id: session.user.companyId,
      ...(startDate && endDate && {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(action && { action }),
      ...(userId && { user_id: userId })
    }

    // Get total count for pagination
    const total = await prisma.audit_log.count({ where })

    // Get paginated results
    const logs = await prisma.audit_log.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json(
      { error: "Error fetching audit logs" },
      { status: 500 }
    )
  }
}

// Export audit logs to CSV
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startDate, endDate, action, userId } = await req.json()

    // Build where clause
    const where = {
      company_id: session.user.companyId,
      ...(startDate && endDate && {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }),
      ...(action && { action }),
      ...(userId && { user_id: userId })
    }

    const logs = await prisma.audit_log.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    // Convert to CSV format
    const csvHeader = 'Timestamp,User,Email,Role,Action,Details,IP Address,User Agent\n'
    const csvRows = logs.map((log: AuditLog) => {
      return [
        log.created_at.toISOString(),
        log.user.name || 'N/A',
        log.user.email,
        log.user.role,
        log.action,
        log.details,
        log.ip_address || 'N/A',
        log.user_agent || 'N/A'
      ].map(field => `"${String(field)}"`).join(',')
    }).join('\n')

    const csv = csvHeader + csvRows

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit_logs_${new Date().toISOString()}.csv"`
      }
    })
  } catch (error) {
    console.error("Audit logs export error:", error)
    return NextResponse.json(
      { error: "Error exporting audit logs" },
      { status: 500 }
    )
  }
}