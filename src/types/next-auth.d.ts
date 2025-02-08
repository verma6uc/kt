import { user_role, user_status, company_status } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string | null
    role: user_role
    status: user_status
    companyId: string
    company: {
      id: string
      name: string
      identifier: string
      status: company_status
    }
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: user_role
      status: user_status
      companyId: string
      company: {
        id: string
        status: company_status
      }
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string | null
    role: user_role
    status: user_status
    companyId: string
    companyStatus: company_status
  }
}