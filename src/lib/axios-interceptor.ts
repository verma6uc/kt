import axios from 'axios'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { calculateRequestSize } from './metrics-service'
import { recordMetrics } from './metrics-middleware'

type AuthError = 'account_suspended' | 'company_inactive' | 'invalid_session'

interface ErrorResponse {
  headers: {
    'x-auth-error'?: AuthError
  }
}

interface RequestMetrics {
  startTime: number
  requestSize?: number
}

// Use WeakMap to store metrics without modifying axios types
const metricsMap = new WeakMap<object, RequestMetrics>()

// Create axios instance with config
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Store metrics in WeakMap
    metricsMap.set(config, {
      startTime: Date.now(),
      requestSize: config.data ? calculateRequestSize(config.data) : undefined
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Get metrics from WeakMap
    const metrics = metricsMap.get(response.config)
    if (metrics) {
      recordMetrics({ ...response.config, _metrics: metrics }, response)
      metricsMap.delete(response.config)
    }
    return response
  },
  async (error) => {
    // Get metrics from WeakMap
    const metrics = error.config ? metricsMap.get(error.config) : null
    if (metrics) {
      recordMetrics({ ...error.config, _metrics: metrics }, null, error)
      metricsMap.delete(error.config)
    }

    const authError = (error.response as ErrorResponse)?.headers?.['x-auth-error']
    
    if (authError) {
      let message = 'You have been logged out.'
      
      switch (authError) {
        case 'account_suspended':
          message = 'Your account has been suspended. Please contact support.'
          break
        case 'company_inactive':
          message = 'Your company account has been deactivated. Please contact support.'
          break
        case 'invalid_session':
          message = 'Your session has expired. Please log in again.'
          break
      }

      toast.error(message, {
        duration: 5000,
        position: 'top-center'
      })

      await signOut({ redirect: true, callbackUrl: '/login' })
    }

    return Promise.reject(error)
  }
)

export default axiosInstance