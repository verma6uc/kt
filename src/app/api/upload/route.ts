import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClientIp } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { audit_action } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File
    if (!file) {
      return new NextResponse('No file uploaded', { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return new NextResponse('Invalid file type. Only JPEG, PNG and GIF are allowed', { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse('File too large. Maximum size is 10MB', { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const fileExt = path.extname(file.name)
    const uniqueId = crypto.randomBytes(5).toString('hex').toUpperCase()
    const timestamp = Date.now()
    const filename = `company-${uniqueId}-${timestamp}${fileExt}`
    const filepath = path.join(uploadDir, filename)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create audit log
    await prisma.audit_log.create({
      data: {
        uuid: crypto.randomUUID(),
        user_id: parseInt(session.user.id),
        action: audit_action.upload,
        details: `Logo uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        ip_address: await getClientIp(request),
        user_agent: request.headers.get('user-agent') || null
      }
    })

    return NextResponse.json({
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}