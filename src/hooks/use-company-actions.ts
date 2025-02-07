import { useState, useCallback } from 'react'
import { Company } from '@/types/company'
import { useToast } from '@/components/providers/toast-provider'

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
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  const { showToast } = useToast()

  const fetchCompanies = useCallback(async (
    page = pagination.currentPage,
    pageSize = pagination.pageSize,
    search = searchQuery,
    sort = sortField,
    direction = sortDirection,
    types = selectedTypes,
    statuses = selectedStatuses,
    industries = selectedIndustries,
    isExport = false
  ) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortField: sort,
        sortDirection: direction
      })

      // Add array parameters
      types.forEach(type => params.append('types[]', type))
      statuses.forEach(status => params.append('statuses[]', status))
      industries.forEach(industry => params.append('industries[]', industry))

      if (isExport) {
        params.append('export', 'true')
      }

      const response = await fetch(`/api/companies?${params}`)
      if (!response.ok) throw new Error('Failed to fetch companies')
      
      if (isExport) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `companies-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        return
      }

      const data: CompanyResponse = await response.json()
      setCompanies(data.companies)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching companies:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch companies'
      })
    } finally {
      setLoading(false)
    }
  }, [
    pagination.currentPage,
    pagination.pageSize,
    searchQuery,
    sortField,
    sortDirection,
    selectedTypes,
    selectedStatuses,
    selectedIndustries,
    showToast
  ])

  const handleCreateCompany = useCallback(async (formData: FormData) => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      await fetchCompanies()
      showToast({
        type: 'success',
        title: 'Company Created',
        message: 'New company has been created successfully'
      })
    } catch (error) {
      console.error('Error creating company:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create company'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchCompanies, showToast])

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

      showToast({
        type: 'success',
        title: 'Company Updated',
        message: `${targetCompany.name} has been updated successfully`
      })

      // Close modal if it was opened
      if (editModalOpen) {
        setEditModalOpen(false)
        setSelectedCompany(null)
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: `Failed to update ${targetCompany.name}`
      })
      throw new Error('Failed to update company')
    }
  }, [selectedCompany, editModalOpen, fetchCompanies, showToast])

  const handleAction = useCallback((company: Company, action: 'edit' | 'suspend' | 'archive') => {
    if (action === 'edit') {
      setSelectedCompany(company)
      setEditModalOpen(true)
    } else if (action === 'suspend') {
      handleUpdateCompany({
        status: 'suspended',
        auditDetails: 'Company suspended. All user access has been temporarily blocked.'
      }, company)
      showToast({
        type: 'warning',
        title: 'Company Suspended',
        message: `${company.name} has been suspended`
      })
    } else if (action === 'archive') {
      handleUpdateCompany({
        status: 'archived',
        auditDetails: 'Company archived. This is a permanent action.'
      }, company)
      showToast({
        type: 'info',
        title: 'Company Archived',
        message: `${company.name} has been archived`
      })
    }
    setActionMenuOpen(null)
  }, [handleUpdateCompany, showToast])

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
    fetchCompanies(page)
  }, [fetchCompanies])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    fetchCompanies(1, pagination.pageSize, query)
  }, [fetchCompanies, pagination.pageSize])

  const handleSort = useCallback((field: keyof Company | 'users') => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)
    fetchCompanies(pagination.currentPage, pagination.pageSize, searchQuery, field, newDirection)
  }, [fetchCompanies, pagination.currentPage, pagination.pageSize, searchQuery, sortField, sortDirection])

  const handleExport = useCallback(() => {
    fetchCompanies(
      pagination.currentPage,
      pagination.pageSize,
      searchQuery,
      sortField,
      sortDirection,
      selectedTypes,
      selectedStatuses,
      selectedIndustries,
      true
    )
  }, [
    fetchCompanies,
    pagination.currentPage,
    pagination.pageSize,
    searchQuery,
    sortField,
    sortDirection,
    selectedTypes,
    selectedStatuses,
    selectedIndustries
  ])

  const handleTypeChange = useCallback((types: string[]) => {
    setSelectedTypes(types)
    fetchCompanies(1, pagination.pageSize, searchQuery, sortField, sortDirection, types, selectedStatuses, selectedIndustries)
  }, [fetchCompanies, pagination.pageSize, searchQuery, sortField, sortDirection, selectedStatuses, selectedIndustries])

  const handleStatusChange = useCallback((statuses: string[]) => {
    setSelectedStatuses(statuses)
    fetchCompanies(1, pagination.pageSize, searchQuery, sortField, sortDirection, selectedTypes, statuses, selectedIndustries)
  }, [fetchCompanies, pagination.pageSize, searchQuery, sortField, sortDirection, selectedTypes, selectedIndustries])

  const handleIndustryChange = useCallback((industries: string[]) => {
    setSelectedIndustries(industries)
    fetchCompanies(1, pagination.pageSize, searchQuery, sortField, sortDirection, selectedTypes, selectedStatuses, industries)
  }, [fetchCompanies, pagination.pageSize, searchQuery, sortField, sortDirection, selectedTypes, selectedStatuses])

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
    selectedTypes,
    selectedStatuses,
    selectedIndustries,
    handleAction,
    handleCreateCompany,
    handleUpdateCompany,
    handleMenuClick,
    handleMenuToggle,
    handleModalClose,
    handlePageChange,
    handleSearch,
    handleSort,
    handleExport,
    handleTypeChange,
    handleStatusChange,
    handleIndustryChange,
    fetchCompanies
  }
}