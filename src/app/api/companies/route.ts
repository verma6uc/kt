import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { company_type, company_status } from '@prisma/client'

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

    const formData = await request.formData()
    const id = parseInt(formData.get('id') as string)
    
    if (!id) {
      return new NextResponse('Company ID is required', { status: 400 })
    }

    // Handle file upload
    let logoUrl: string | undefined
    const logo = formData.get('logo') as File
    if (logo) {
      try {
        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Create unique filename
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

    // Prepare update data
    const updateData = {
      name: formData.get('name') as string,
      identifier: formData.get('identifier') as string,
      description: formData.get('description') as string || null,
      website: formData.get('website') as string || null,
      type: formData.get('type') as company_type,
      industry: formData.get('industry') as string || null,
      status: formData.get('status') as company_status,
      tax_id: formData.get('tax_id') as string || null,
      registration_number: formData.get('registration_number') as string || null,
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

    // Create audit log entries for each changed field
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

      if (changes.length > 0) {
        await prisma.audit_log.create({
          data: {
            user_id: parseInt(session.user.id),
            company_id: id,
            action: 'update',
            details: changes.join('\n'),
          },
        })
      }
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}