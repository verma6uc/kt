import type { InternalAxiosRequestConfig } from 'axios'

export interface RequestMetadata {
  startTime: number
  userId?: number
  companyId?: number
  ipAddress?: string
  requestSize?: number
}

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: RequestMetadata
}

// Extend the AxiosRequestConfig to include our metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata
  }
}