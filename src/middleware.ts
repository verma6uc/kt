import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export default withAuth(
  async function middleware(request) {
    const token = request.nextauth.token

    // Skip auth check for public routes
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Check user status and company status
      const user = await prisma.user.findUnique({
        where: { id: parseInt(token.id as string) },
        select: {
          status: true,
          company: {
            select: {
              status: true
            }
          }
        }
      })

      if (!user) {
        return new NextResponse('User not found', { status: 401 })
      }

      // Check if user is suspended
      if (user.status === 'suspended') {
        return new NextResponse('Account suspended', { 
          status: 403,
          headers: {
            'X-Auth-Error': 'account_suspended'
          }
        })
      }

      // Check if company is inactive
      if (user.company.status === 'inactive') {
        return new NextResponse('Company inactive', { 
          status: 403,
          headers: {
            'X-Auth-Error': 'company_inactive'
          }
        })
      }

      // Check if session is valid
      const session = await prisma.session.findFirst({
        where: {
          user_id: parseInt(token.id as string),
          session_token: request.cookies.get('next-auth.session-token')?.value
        }
      })

      if (!session) {
        return new NextResponse('Invalid session', { 
          status: 401,
          headers: {
            'X-Auth-Error': 'invalid_session'
          }
        })
      }

      // Allow the request to proceed
      return NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      return new NextResponse('Internal server error', { status: 500 })
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/companies/:path*',
    '/api/notifications/:path*',
    '/api/settings/:path*',
    '/api/audit/:path*'
  ]
}