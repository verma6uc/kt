import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { user_role, user_status, company_status } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
                identifier: true,
                status: true
              }
            }
          }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role as user_role,
          status: user.status as user_status,
          companyId: user.company_id.toString(),
          company: {
            id: user.company.id.toString(),
            name: user.company.name,
            identifier: user.company.identifier,
            status: user.company.status as company_status
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
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          companyId: user.companyId,
          companyStatus: user.company.status
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          status: token.status,
          companyId: token.companyId,
          company: {
            id: token.companyId,
            status: token.companyStatus
          }
        }
      }
    }
  },
  pages: {
    signIn: '/login'
  }
}