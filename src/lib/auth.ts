import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import crypto from 'crypto'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" }
      },
      async authorize(credentials) {
        console.log('=== Auth Flow Start ===')
        console.log('1. Authorize function called with credentials:', { email: credentials?.email })

        if (!credentials?.email) {
          console.log('No email provided')
          throw new Error('CredentialsSignin')
        }

        try {
          console.log('2. Finding user in database')
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              company: {
                include: {
                  security_config: true
                }
              }
            }
          })

          console.log('3. User lookup result:', user ? {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
          } : 'No user found')

          if (!user) {
            throw new Error('CredentialsSignin')
          }

          // Log successful login
          console.log('4. Creating audit log')
          const auditLog = await prisma.audit_log.create({
            data: {
              uuid: crypto.randomUUID(),
              user_id: user.id,
              company_id: user.company_id,
              action: 'login',
              details: 'Successful login',
              ip_address: '127.0.0.1',
              user_agent: 'Unknown'
            }
          })

          console.log('5. Preparing user data for session')
          const userData = {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.company_id.toString(),
            company: {
              id: user.company.id.toString(),
              name: user.company.name,
              identifier: user.company.identifier,
              securityConfig: user.company.security_config
            }
          }

          console.log('6. Returning user data:', userData)
          console.log('=== Auth Flow Complete ===')
          return userData

        } catch (error) {
          console.error('Error in authorize function:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('=== JWT Callback ===')
      console.log('Input token:', token)
      console.log('Input user:', user)

      if (user) {
        const newToken = {
          ...token,
          id: user.id,
          role: user.role,
          companyId: user.companyId,
          company: user.company
        }
        console.log('New token:', newToken)
        return newToken
      }
      console.log('Returning existing token')
      return token
    },
    async session({ session, token }) {
      console.log('=== Session Callback ===')
      console.log('Input session:', session)
      console.log('Input token:', token)

      const newSession = {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          companyId: token.companyId,
          company: token.company
        }
      }
      console.log('New session:', newSession)
      return newSession
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata)
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}