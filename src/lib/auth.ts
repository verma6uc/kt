import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
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

        // Get request metadata
        let ip_address = '127.0.0.1'
        let user_agent = 'Unknown'

        try {
          const headersList = await headers()
          ip_address = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      '127.0.0.1'
          user_agent = headersList.get('user-agent') || 'Unknown'
        } catch (error) {
          console.error('Failed to get request headers:', error)
        }

        // Check if account is locked
        if (user.status === 'locked') {
          // Create audit log for locked account attempt
          await prisma.audit_log.create({
            data: {
              user_id: user.id,
              company_id: user.company_id,
              action: 'login_failed',
              details: 'Login attempt on locked account',
              ip_address,
              user_agent
            }
          })
          throw new Error('AccountLocked')
        }

        // Check if account is suspended
        if (user.status === 'suspended') {
          // Create audit log for suspended account attempt
          await prisma.audit_log.create({
            data: {
              user_id: user.id,
              company_id: user.company_id,
              action: 'login_failed',
              details: 'Login attempt on suspended account',
              ip_address,
              user_agent
            }
          })
          throw new Error('AccessDenied')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Log failed login attempt
          const auditLog = await prisma.audit_log.create({
            data: {
              user_id: user.id,
              company_id: user.company_id,
              action: 'login_failed',
              details: 'Invalid password attempt',
              ip_address,
              user_agent
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
              },
              {
                audit_log_id: auditLog.id,
                key: 'failed_attempts',
                value: (user.failed_login_attempts + 1).toString()
              }
            ]
          })

          // Update failed login attempts
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              failed_login_attempts: user.failed_login_attempts + 1,
              last_failed_attempt: new Date(),
              status: user.failed_login_attempts + 1 >= (user.company.security_config?.max_failed_attempts || 5) 
                ? 'locked' 
                : user.status
            }
          })

          throw new Error('CredentialsSignin')
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
            ip_address,
            user_agent
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