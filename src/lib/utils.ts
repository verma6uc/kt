import { NextRequest } from 'next/server'

export async function getClientIp(request: NextRequest): Promise<string> {
  try {
    // Try x-forwarded-for first
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      // Get the first IP in the list (client's original IP)
      const ips = forwardedFor.split(',')
      const clientIp = ips[0].trim()
      if (clientIp && !['::1', '127.0.0.1', 'localhost'].includes(clientIp)) {
        return clientIp
      }
    }

    // Try x-real-ip
    const realIp = request.headers.get('x-real-ip')
    if (realIp && !['::1', '127.0.0.1', 'localhost'].includes(realIp)) {
      return realIp
    }

    // If we're still getting localhost IPs, try to get the external IP
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      if (response.ok) {
        const data = await response.json()
        return data.ip
      }
    } catch (error) {
      console.error('Error fetching external IP:', error)
    }

    return 'unknown'
  } catch (error) {
    return 'unknown'
  }
}