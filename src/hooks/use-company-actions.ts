import { useState, useCallback } from 'react'
import { Company } from '@/types/company'

interface CompanyUpdate extends Partial<Company> {
  auditDetails?: string
  auditMetadata?: Record<string, string>
}

interface PaginationInfo {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
}

interface CompanyResponse {
  companies: Company[]
  pagination: PaginationInfo
}

export function useCompanyActions(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  })
  const [sortField, setSortField] = useState<keyof Company | 'users'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchCompanies = useCallback(async (
    page = pagination.currentPage,
    pageSize = pagination.pageSize,
    search = searchQuery,
    sort = sortField,
    direction = sortDirection
  ) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortField: sort,
        sortDirection: direction
      })

      const response = await fetch(`/api/companies?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      
      const data: CompanyResponse = await response.json()
      setCompanies(data.companies)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.pageSize, searchQuery, sortField, sortDirection])

  const handleUpdateCompany = useCallback(async (data: CompanyUpdate, company?: Company) => {
    const targetCompany = company || selectedCompany
    if (!targetCompany) return

    try {
      const response = await fetch('/api/companies', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: targetCompany.id,
          ...data,
          auditDetails: data.auditDetails,
          auditMetadata: data.auditMetadata,
        }),
      })

      if (!response.ok) throw new Error('Failed to update company')

      // Refresh companies list
      await fetchCompanies()

      // Close modal if it was opened
      if (editModalOpen) {
        setEditModalOpen(false)
        setSelectedCompany(null)
      }
    } catch (error) {
      throw new Error('Failed to update company')
    }
  }, [selectedCompany, editModalOpen, fetchCompanies])

  const handleAction = useCallback((company: Company, action: 'edit' | 'suspend' | 'archive') => {
    if (action === 'edit') {
      setSelectedCompany(company)
      setEditModalOpen(true)
    } else if (action === 'suspend') {
      handleUpdateCompany({
        status: 'suspended',
        auditDetails: 'Company suspended. All user access has been temporarily blocked.'
      }, company)
    } else if (action === 'archive') {
      handleUpdateCompany({
        status: 'archived',
        auditDetails: 'Company archived. This is a permanent action.'
      }, company)
    }
    setActionMenuOpen(null)
  }, [handleUpdateCompany])

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleMenuToggle = useCallback((companyId: number) => {
    setActionMenuOpen(actionMenuOpen === companyId ? null : companyId)
  }, [actionMenuOpen])

  const handleModalClose = useCallback(() => {
    setEditModalOpen(false)
    setSelectedCompany(null)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    fetchCompanies(page, pagination.pageSize, searchQuery, sortField, sortDirection)
  }, [fetchCompanies, pagination.pageSize, searchQuery, sortField, sortDirection])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    fetchCompanies(1, pagination.pageSize, query, sortField, sortDirection)
  }, [fetchCompanies, pagination.pageSize, sortField, sortDirection])

  const handleSort = useCallback((field: keyof Company | 'users') => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)
    fetchCompanies(pagination.currentPage, pagination.pageSize, searchQuery, field, newDirection)
  }, [fetchCompanies, pagination.currentPage, pagination.pageSize, searchQuery, sortField, sortDirection])

  return {
    companies,
    selectedCompany,
    editModalOpen,
    actionMenuOpen,
    loading,
    pagination,
    sortField,
    sortDirection,
    searchQuery,
    handleAction,
    handleUpdateCompany,
    handleMenuClick,
    handleMenuToggle,
    handleModalClose,
    handlePageChange,
    handleSearch,
    handleSort,
    fetchCompanies
  }
}