import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { company_type, company_status, audit_action, Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import path from 'path'

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
            { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { identifier: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { industry: { contains: search, mode: 'insensitive' as Prisma.QueryMode } }
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
    let orderBy: Prisma.companyOrderByWithRelationInput = {}
    if (sortField === 'users') {
      orderBy = {
        users: {
          _count: sortDirection
        }
      }
    } else {
      orderBy = {
        [sortField]: sortDirection
      }
    }

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
            users: true,
            api_metrics: true,
            system_metrics: true
          },
        },
        users: {
          where: {
            role: 'company_admin',
            status: 'active'
          },
          select: {
            email: true,
            name: true
          }
        },
        company_health: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        },
        api_metrics: {
          orderBy: {
            created_at: 'desc'
          },
          take: 100
        }
      },
    })

    // Handle export request
    if (isExport) {
      const csvRows = [
        // CSV Header
        ['ID', 'Name', 'Identifier', 'Type', 'Status', 'Industry', 'Users', 'API Metrics', 'System Metrics'].join(','),
        // Data rows
        ...companies.map(company => [
          company.id,
          `"${company.name}"`,
          company.identifier,
          company.type,
          company.status,
          company.industry || '',
          company._count.users,
          company._count.api_metrics,
          company._count.system_metrics
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const logo = formData.get('logo') as File | null

    if (!name) {
      return new NextResponse('Company name is required', { status: 400 })
    }

    // Generate unique identifier
    const identifier = nanoid(10).toUpperCase()

    // Check if identifier is unique
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { identifier },
          { name: { equals: name, mode: 'insensitive' as Prisma.QueryMode } }
        ]
      }
    })

    if (existingCompany) {
      if (existingCompany.name.toLowerCase() === name.toLowerCase()) {
        return new NextResponse('Company name already exists', { status: 400 })
      }
      // If it's an identifier collision (very unlikely), generate a new one
      return new NextResponse('Please try again', { status: 409 })
    }

    let logoUrl: string | undefined

    if (logo) {
      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public/uploads')
      await mkdir(uploadsDir, { recursive: true })

      // Save logo file
      const bytes = await logo.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = logo.name.split('.').pop()
      const filename = `company-${identifier}-${Date.now()}.${ext}`
      const filepath = path.join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      logoUrl = `/uploads/${filename}`
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        identifier,
        logo_url: logoUrl,
        status: 'pending_setup' as company_status,
        type: 'small_business' as company_type,
        security_config: {
          create: {
            password_history_limit: 3,
            password_expiry_days: 90,
            max_failed_attempts: 5,
            session_timeout_mins: 60,
            enforce_single_session: false
          }
        }
      },
      include: {
        security_config: true
      }
    })

    // Create audit log
    await prisma.audit_log.create({
      data: {
        user_id: parseInt(session.user.id),
        company_id: company.id,
        action: audit_action.create,
        details: `Company created: ${company.name} (${company.identifier})`,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        user_agent: request.headers.get('user-agent') || null
      }
    })

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error creating company:', error)
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

    // Get request metadata for audit log
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const user_agent = request.headers.get('user-agent')

    // Handle both FormData and JSON requests
    const isFormData = request.headers.get('content-type')?.includes('multipart/form-data')
    const data = isFormData ? await request.formData() : await request.json()
    
    // Get company ID
    const id = isFormData ? parseInt(data.get('id') as string) : data.id
    
    if (!id) {
      return new NextResponse('Company ID is required', { status: 400 })
    }

    // Handle file upload for FormData requests
    let logoUrl: string | undefined
    if (isFormData) {
      const logo = data.get('logo') as File
      if (logo) {
        try {
          const bytes = await logo.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          const ext = logo.name.split('.').pop()
          const filename = `company-${id}-${Date.now()}.${ext}`
          const path = `public/uploads/${filename}`
          
          await writeFile(path, buffer)
          logoUrl = `/uploads/${filename}`
        } catch (error) {
          console.error('Error uploading logo:', error)
          return new NextResponse('Failed to upload logo', { status: 500 })
        }
      }
    }

    // Prepare update data
    const updateData = {
      name: isFormData ? data.get('name') as string : data.name,
      identifier: isFormData ? data.get('identifier') as string : data.identifier,
      description: isFormData ? (data.get('description') as string || null) : data.description,
      website: isFormData ? (data.get('website') as string || null) : data.website,
      type: isFormData ? data.get('type') as company_type : data.type,
      industry: isFormData ? (data.get('industry') as string || null) : data.industry,
      status: isFormData ? data.get('status') as company_status : data.status,
      tax_id: isFormData ? (data.get('tax_id') as string || null) : data.tax_id,
      registration_number: isFormData ? 
        (data.get('registration_number') as string || null) : 
        data.registration_number,
      ...(logoUrl && { logo_url: logoUrl }),
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

    // Update company
    const company = await prisma.company.update({
      where: { id },
      include: {
        users: true,
        _count: true,
      },
      data: updateData,
    })

    // Create audit log entries
    if (oldCompany) {
      const changes: string[] = []
      
      Object.entries(updateData).forEach(([key, newValue]) => {
        const oldValue = oldCompany[key as keyof typeof oldCompany]
        
        if (oldValue !== newValue) {
          switch (key) {
            case 'status':
              changes.push(`Status changed from ${oldValue} to ${newValue}`)
              break
            case 'name':
              changes.push(`Name changed from "${oldValue}" to "${newValue}"`)
              break
            case 'industry':
              changes.push(`Industry changed from ${oldValue || 'none'} to ${newValue || 'none'}`)
              break
            case 'type':
              changes.push(`Type changed from ${oldValue} to ${newValue}`)
              break
            case 'logo_url':
              changes.push('Company logo was updated')
              break
            case 'website':
              changes.push(`Website changed from ${oldValue || 'none'} to ${newValue || 'none'}`)
              break
            case 'tax_id':
              changes.push(`Tax ID changed from ${oldValue || 'none'} to ${newValue || 'none'}`)
              break
            case 'registration_number':
              changes.push(`Registration number changed from ${oldValue || 'none'} to ${newValue || 'none'}`)
              break
            default:
              changes.push(`${key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} was updated`)
          }
        }
      })

      // Create audit log if there are changes
      if (changes.length > 0 || (!isFormData && data.auditDetails)) {
        const auditDetails = !isFormData && data.auditDetails ? 
          data.auditDetails : 
          changes.join('\n')

        await prisma.audit_log.create({
          data: {
            user_id: parseInt(session.user.id),
            company_id: id,
            action: audit_action.update,
            details: auditDetails,
            ip_address: ip_address || null,
            user_agent: user_agent || null,
          },
        })

        // Create audit metadata if provided
        if (!isFormData && data.auditMetadata) {
          const metadata = Object.entries(data.auditMetadata)
          if (metadata.length > 0) {
            await prisma.audit_metadata.createMany({
              data: metadata.map(([key, value]) => ({
                audit_log_id: id,
                key,
                value: String(value),
              })),
            })
          }
        }
      }
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}