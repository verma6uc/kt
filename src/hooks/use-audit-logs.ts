"use client"

import { useState, useCallback } from 'react'

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/audit/logs')
      if (!response.ok) throw new Error('Failed to fetch audit logs')
      const data = await response.json()
      setAuditLogs(data.logs)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    auditLogs,
    loading,
    fetchAuditLogs
  }
}