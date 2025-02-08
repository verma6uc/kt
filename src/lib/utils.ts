import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}

export function convertToCSV(data: any[], columns: { key: string; header: string }[]): string {
  // Create header row
  const headerRow = columns.map(col => `"${col.header}"`).join(',')
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key]
      // Handle special cases
      if (value === null || value === undefined) return '""'
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`
      if (value instanceof Date) return `"${value.toISOString()}"`
      return `"${value}"`
    }).join(',')
  })

  // Combine header and rows
  return [headerRow, ...rows].join('\n')
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  // Handle IE specifically
  if (typeof window !== 'undefined' && window.navigator && 
      'msSaveOrOpenBlob' in window.navigator) {
    (window.navigator as any).msSaveOrOpenBlob(blob, filename)
  } else {
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export const companyColumns = [
  { key: 'name', header: 'Company Name' },
  { key: 'identifier', header: 'Identifier' },
  { key: 'industry', header: 'Industry' },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status' },
  { key: 'created_at', header: 'Created Date' }
]