import { headers } from 'next/headers'

export function getRequestHeaders() {
  try {
    const headersList = headers()
    return {
      ipAddress: headersList.get('x-forwarded-for') || undefined,
      userAgent: headersList.get('user-agent') || undefined
    }
  } catch {
    return {
      ipAddress: undefined,
      userAgent: undefined
    }
  }
}