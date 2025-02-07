import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string | null
      role: 'super_admin' | 'company_admin' | 'user'
      companyId: string
      company: {
        id: string
        name: string
        identifier: string
        securityConfig: {
          id: number
          uuid: string
          company_id: number
          password_history_limit: number
          password_expiry_days: number
          max_failed_attempts: number
          session_timeout_mins: number
          enforce_single_session: boolean
        } | null
      }
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name: string | null
    role: 'super_admin' | 'company_admin' | 'user'
    companyId: string
    company: {
      id: string
      name: string
      identifier: string
      securityConfig: {
        id: number
        uuid: string
        company_id: number
        password_history_limit: number
        password_expiry_days: number
        max_failed_attempts: number
        session_timeout_mins: number
        enforce_single_session: boolean
      } | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'super_admin' | 'company_admin' | 'user'
    companyId: string
    company: {
      id: string
      name: string
      identifier: string
      securityConfig: {
        id: number
        uuid: string
        company_id: number
        password_history_limit: number
        password_expiry_days: number
        max_failed_attempts: number
        session_timeout_mins: number
        enforce_single_session: boolean
      } | null
    }
  }
}