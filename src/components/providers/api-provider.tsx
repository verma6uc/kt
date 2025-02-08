'use client'

import { useEffect } from 'react'
import axiosInstance from '@/lib/axios-interceptor'

// Replace the global fetch with our intercepted axios instance
export function ApiProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const originalFetch = global.fetch

    // Override global fetch
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        // Skip intercepting non-API calls
        const url = input instanceof URL ? input.toString() : input.toString()
        if (!url.startsWith('/api/')) {
          return originalFetch(input, init)
        }

        const response = await axiosInstance({
          method: init?.method || 'GET',
          url,
          data: init?.body ? JSON.parse(init.body.toString()) : undefined,
          headers: init?.headers as Record<string, string>,
        })

        // Convert axios response to fetch Response
        const responseBody = JSON.stringify(response.data)
        const responseInit: ResponseInit = {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(response.headers as HeadersInit),
        }

        return new Response(responseBody, responseInit)
      } catch (error: any) {
        if (error.response) {
          const errorBody = JSON.stringify(error.response.data)
          const errorInit: ResponseInit = {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: new Headers(error.response.headers as HeadersInit),
          }

          return new Response(errorBody, errorInit)
        }
        // For network errors, etc., create a failed response
        return new Response(JSON.stringify({ message: error.message }), {
          status: 500,
          statusText: 'Internal Server Error',
        })
      }
    }

    // Cleanup
    return () => {
      global.fetch = originalFetch
    }
  }, [])

  return <>{children}</>
}