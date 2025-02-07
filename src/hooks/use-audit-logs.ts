import { useState, useCallback } from 'react'
import { useToast } from '@/components/providers/toast-provider'

interface AuditMetadata {
  id: number
  audit_log_id: number
  key: string
  value: string
}

interface AuditLog {
  id: number
  action: string
  details: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user: {
    id: number
    name: string | null
    email: string
    role: string
  }
  company: {
    id: number
    name: string
    identifier: string
  }
  metadata: AuditMetadata[]
}

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

interface AuditLogsResponse {
  auditLogs: AuditLog[]
  pagination: PaginationInfo
}

export function useAuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { showToast } = useToast()

  const fetchAuditLogs = useCallback(async (
    page = pagination.currentPage,
    pageSize = pagination.pageSize,
    search = searchQuery,
    actions = selectedActions,
    start = startDate,
    end = endDate
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search
      })

      // Add array parameters
      actions.forEach(action => params.append('action', action))
      if (start) params.append('startDate', start)
      if (end) params.append('endDate', end)

      const response = await fetch(`/api/audit/logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch audit logs')

      const data: AuditLogsResponse = await response.json()
      setAuditLogs(data.auditLogs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch audit logs'
      })
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.pageSize, searchQuery, selectedActions, startDate, endDate, showToast])

  const handlePageChange = useCallback((page: number) => {
    fetchAuditLogs(page)
  }, [fetchAuditLogs])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    fetchAuditLogs(1, pagination.pageSize, query)
  }, [fetchAuditLogs, pagination.pageSize])

  const handleActionChange = useCallback((actions: string[]) => {
    setSelectedActions(actions)
    fetchAuditLogs(1, pagination.pageSize, searchQuery, actions)
  }, [fetchAuditLogs, pagination.pageSize, searchQuery])

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date)
    fetchAuditLogs(1, pagination.pageSize, searchQuery, selectedActions, date, endDate)
  }, [fetchAuditLogs, pagination.pageSize, searchQuery, selectedActions, endDate])

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date)
    fetchAuditLogs(1, pagination.pageSize, searchQuery, selectedActions, startDate, date)
  }, [fetchAuditLogs, pagination.pageSize, searchQuery, selectedActions, startDate])

  return {
    auditLogs,
    loading,
    pagination,
    searchQuery,
    selectedActions,
    startDate,
    endDate,
    handlePageChange,
    handleSearch,
    handleActionChange,
    handleStartDateChange,
    handleEndDateChange,
    fetchAuditLogs
  }
}