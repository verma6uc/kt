import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { audit_action } from '@prisma/client'
import crypto from 'crypto'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'super_admin') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return new NextResponse('Invalid company ID', { status: 400 })
    }

    const data = await request.json()
    const { name, identifier, logo_url } = data

    // Validate required fields
    if (!name?.trim() || !identifier?.trim()) {
      return new NextResponse('Name and identifier are required', { status: 400 })
    }

    // Check if identifier is already taken by another company
    const existingCompany = await prisma.company.findFirst({
      where: {
        identifier: identifier.trim(),
        id: { not: id }
      }
    })

    if (existingCompany) {
      return new NextResponse('Identifier is already taken', { status: 400 })
    }

    // Get current company state for audit log
    const oldCompany = await prisma.company.findUnique({
      where: { id },
      select: {
        name: true,
        identifier: true,
        logo_url: true
      }
    })

    if (!oldCompany) {
      return new NextResponse('Company not found', { status: 404 })
    }

    // Update company with only allowed fields
    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name.trim(),
        identifier: identifier.trim(),
        logo_url,
        updated_at: new Date()
      }
    })

    // Create audit log entries for changed fields
    const changes: string[] = []
    if (oldCompany.name !== name.trim()) {
      changes.push(`Name: ${oldCompany.name} → ${name.trim()}`)
    }
    if (oldCompany.identifier !== identifier.trim()) {
      changes.push(`Identifier: ${oldCompany.identifier} → ${identifier.trim()}`)
    }
    if (oldCompany.logo_url !== logo_url) {
      changes.push(`Logo: ${oldCompany.logo_url ? 'Changed' : 'Added'}`)
    }

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