import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('CredentialsSignin')
        }

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

        if (!user) {
          throw new Error('CredentialsSignin')
        }

        // Check if account is locked
        if (user.status === 'locked') {
          await prisma.audit_log.create({
            data: {
              user_id: user.id,
              company_id: user.company_id,
              action: 'login_failed',
              details: 'Login attempt on locked account',
              ip_address: '127.0.0.1',
              user_agent: 'Unknown'
            }
          })
          throw new Error('AccountLocked')
        }

        // Check if account is suspended
        if (user.status === 'suspended') {
          await prisma.audit_log.create({
            data: {
              user_id: user.id,
              company_id: user.company_id,
              action: 'login_failed',
              details: 'Login attempt on suspended account',
              ip_address: '127.0.0.1',
              user_agent: 'Unknown'
            }
          })
          throw new Error('AccessDenied')
        }

        // Reset failed login attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: 0,
            last_failed_attempt: null
          }
        })

        // Log successful login
        const auditLog = await prisma.audit_log.create({
          data: {
            user_id: user.id,
            company_id: user.company_id,
            action: 'login',
            details: 'Successful login',
            ip_address: '127.0.0.1',
            user_agent: 'Unknown'
          }
        })

        // Add audit metadata
        await prisma.audit_metadata.createMany({
          data: [
            {
              audit_log_id: auditLog.id,
              key: 'email',
              value: user.email
            },
            {
              audit_log_id: auditLog.id,
              key: 'timestamp',
              value: new Date().toISOString()
            }
          ]
        })

        return {
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
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          companyId: user.companyId,
          company: user.company
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          companyId: token.companyId,
          company: token.company
        }
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET
}