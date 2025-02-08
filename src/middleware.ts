import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check user status from token
    if (token.status === 'suspended') {
      return new NextResponse('Account suspended', { 
        status: 403,
        headers: {
          'X-Auth-Error': 'account_suspended'
        }
      })
    }

    // Check company status from token
    if (token.companyStatus === 'inactive') {
      return new NextResponse('Company inactive', { 
        status: 403,
        headers: {
          'X-Auth-Error': 'company_inactive'
        }
      })
    }

    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Basic token presence check
        return !!token
      }
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