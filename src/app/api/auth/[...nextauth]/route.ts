import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { AuthService } from "@/lib/auth-service"
import { NotificationService } from "@/lib/notification-service"
import { headers } from "next/headers"

async function getRequestHeaders() {
  try {
    const headersList = await headers();
    return {
      ipAddress: headersList.has('x-forwarded-for') ? (headersList.get('x-forwarded-for') ?? undefined) : undefined,
      userAgent: headersList.has('user-agent') ? (headersList.get('user-agent') ?? undefined) : undefined
    };
  } catch {
    return {
      ipAddress: undefined,
      userAgent: undefined
    };
  }
}

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user }) {
      // Check if user can login
      const { canLogin, reason } = await AuthService.canUserLogin(user.id)
      if (!canLogin) {
        throw new Error(reason || 'Login not allowed')
      }

      // Check if password needs to be changed
      const needsChange = await AuthService.doesPasswordNeedChange(user.id)
      if (needsChange) {
        throw new Error('Password expired. Please change your password.')
      }

      // Reset failed login attempts on successful login
      await AuthService.resetFailedAttempts(user.id)

      // Log successful login
      const { ipAddress, userAgent } = await getRequestHeaders()

      await AuthService.logAudit({
        userId: user.id,
        companyId: user.companyId,
        action: 'login',
        details: 'User logged in successfully',
        ipAddress,
        userAgent,
      })

      return true
    },
  },
  events: {
    async signIn({ user }) {
      // Additional sign-in events if needed
    },
    async signOut({ session, token }) {
      if (token) {
        // Log logout
        const { ipAddress, userAgent } = await getRequestHeaders()

        await AuthService.logAudit({
          userId: token.id,
          companyId: token.companyId,
          action: 'logout',
          details: 'User logged out',
          ipAddress,
          userAgent,
        })
      }
    }
  }
})

export { handler as GET, handler as POST }