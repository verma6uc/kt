import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma, notification_status, notification_priority } from '@prisma/client'

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
    const status = searchParams.get('status') as notification_status | undefined
    const priority = searchParams.get('priority') as notification_priority | undefined
    const sortField = searchParams.get('sortField') || 'created_at'
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc'

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

    // Build order by clause
    const orderBy: Prisma.notificationOrderByWithRelationInput = {
      [sortField]: sortDirection
    }

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: whereClause
    })

    // Get notifications with pagination, search, and sorting
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy,
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing notification ID', { status: 400 })
    }

    await prisma.notification.delete({
      where: {
        id: parseInt(id),
        user_id: parseInt(session.user.id)
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}