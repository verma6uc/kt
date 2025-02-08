

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notification_status, notification_priority, Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as notification_status | null
    const priority = searchParams.get('priority') as notification_priority | null

    // Build where clause for search and filters
    const whereClause: Prisma.notificationWhereInput = {
      user_id: parseInt(session.user.id),
      AND: [
        // Search
        search ? {
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { message: { contains: search, mode: Prisma.QueryMode.insensitive } }
          ]
        } : {},
        // Status filter
        status ? { status } : {},
        // Priority filter
        priority ? { priority } : {}
      ]
    }

    console.log('Session user ID:', session.user.id)
    console.log('Where clause:', JSON.stringify(whereClause, null, 2))

    // Enable query logging
    prisma.$use(async (params, next) => {
      const before = Date.now()
      const result = await next(params)
      const after = Date.now()
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
      console.log('Query params:', JSON.stringify(params, null, 2))
      return result
    })

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause
    })

    console.log('Total count:', totalCount)

    // Get notifications with pagination, search, and sorting
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log('Found notifications:', notifications.length)

    return NextResponse.json({
      notifications,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()
    const { id, status } = data

    if (!id || !status) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const notification = await prisma.notification.update({
      where: {
        id: parseInt(id),
        user_id: parseInt(session.user.id)
      },
      data: {
        status: status as notification_status,
        read_at: status === 'read' ? new Date() : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}