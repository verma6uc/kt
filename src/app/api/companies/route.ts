import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { company_type, company_status, audit_action, notification_priority, Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const data = await request.json()
    const { name, logo_url } = data

    if (!name) {
      return new NextResponse('Company name is required', { status: 400 })
    }

    // Check if company name already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: Prisma.QueryMode.insensitive }
      }
    })

    if (existingCompany) {
      return new NextResponse('Company name already exists', { status: 400 })
    }

    // Generate unique identifier
    const identifier = nanoid(10).toUpperCase()

    const now = new Date()

    // Create company with minimal required data
    const company = await prisma.company.create({
      data: {
        uuid: crypto.randomUUID(),
        name,
        identifier,
        logo_url: logo_url || null,
        status: 'pending_setup' as company_status,
        type: 'small_business' as company_type,
        updated_at: now,
        security_config: {
          create: {
            uuid: crypto.randomUUID(),
            password_history_limit: 3,
            password_expiry_days: 90,
            max_failed_attempts: 5,
            session_timeout_mins: 60,
            enforce_single_session: false,
            updated_at: now
          }
        }
      }
    })

    // Create audit log
    const auditDetails = [
      `Company created: ${company.name} (${company.identifier})`,
      `Initial Status: ${company.status}`,
      `Type: ${company.type}`,
      `Logo: ${company.logo_url ? 'Uploaded' : 'Not provided'}`
    ].join('\n')

    await prisma.audit_log.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: parseInt(session.user.id),
        company_id: company.id,
        action: audit_action.create,
        details: auditDetails,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null
      }
    })

    // Notify super admins
    const superAdmins = await prisma.user.findMany({
      where: {
        role: 'super_admin',
        status: 'active'
      }
    })

    await Promise.all(superAdmins.map(admin => 
      prisma.notification.create({
        data: {
          uuid: crypto.randomUUID(),
          user_id: admin.id,
          company_id: company.id,
          title: 'New Company Created',
          message: `${session.user.name || 'A super admin'} created a new company: ${company.name} (${company.identifier})`,
          priority: 'medium' as notification_priority,
          status: 'unread',
          link: `/dashboard/companies?company=${company.id}`
        }
      })
    ))

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'name'
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc'
    const types = searchParams.getAll('types[]')
    const statuses = searchParams.getAll('statuses[]')
    const industries = searchParams.getAll('industries[]')
    const isExport = searchParams.get('export') === 'true'

    // Build where clause for search and filters
    const whereClause: Prisma.companyWhereInput = {
      AND: [
        // Search
        search ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { identifier: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { industry: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        // Type filter
        types.length > 0 ? { type: { in: types as company_type[] } } : {},
        // Status filter
        statuses.length > 0 ? { status: { in: statuses as company_status[] } } : {},
        // Industry filter
        industries.length > 0 ? { industry: { in: industries } } : {}
      ]
    }

    // Build order by clause
    const orderBy: Prisma.companyOrderByWithRelationInput = sortField === 'user' 
      ? { user: { _count: sortDirection } }
      : { [sortField]: sortDirection }

    // Get total count for pagination
    const totalCount = await prisma.company.count({
      where: whereClause
    })

    // Get companies with pagination, search, and sorting
    const companies = await prisma.company.findMany({
      where: whereClause,
      orderBy,
      skip: isExport ? 0 : (page - 1) * pageSize,
      take: isExport ? undefined : pageSize,
      include: {
        _count: {
          select: {
            user: true
          },
        },
        user: {
          where: {
            status: 'active'
          },
          select: {
            email: true,
            name: true
          }
        }
      },
    })

    // Handle export request
    if (isExport) {
      const csvRows = [
        // CSV Header
        ['ID', 'Name', 'Identifier', 'Type', 'Status', 'Industry', 'Users'].join(','),
        // Data rows
        ...companies.map(company => [
          company.id,
          `"${company.name}"`,
          company.identifier,
          company.type,
          company.status,
          company.industry || '',
          (company as any)._count.user
        ].join(','))
      ]

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="companies-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json({
      companies,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return new NextResponse('Company ID is required', { status: 400 })
    }

    // Get current company state for audit log
    const oldCompany = await prisma.company.findUnique({ 
      where: { id },
      select: {
        name: true,
        identifier: true,
        description: true,
        website: true,
        type: true,
        industry: true,
        status: true,
        tax_id: true,
        registration_number: true,
        logo_url: true,
      }
    })

    if (!oldCompany) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Update company
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    })

    // Create audit log entries
    const changes: string[] = []
    Object.entries(updateData).forEach(([key, newValue]) => {
      const oldValue = oldCompany[key as keyof typeof oldCompany]
      if (oldValue !== newValue) {
        changes.push(`${key}: ${oldValue} → ${newValue}`)
      }
    })

    if (changes.length > 0) {
      await prisma.audit_log.create({
        data: {
          uuid: crypto.randomUUID(),
          user_id: parseInt(session.user.id),
          company_id: id,
          action: audit_action.update,
          details: changes.join('\n'),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          user_agent: request.headers.get('user-agent') || null,
        },
      })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}