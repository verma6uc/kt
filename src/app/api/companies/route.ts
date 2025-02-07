import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { company_type, company_status, audit_action } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const companies = await prisma.company.findMany({
      orderBy: {
        name: 'asc',
      },
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

    return NextResponse.json(companies)
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