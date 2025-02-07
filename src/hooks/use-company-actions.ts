import { useState, useCallback } from 'react'
import { Company } from '@/types/company'

interface CompanyUpdate extends Partial<Company> {
  auditDetails?: string
  auditMetadata?: Record<string, string>
}

export function useCompanyActions(initialCompanies: Company[] = []) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies')
      if (!response.ok) throw new Error('Failed to fetch companies')
      const data = await response.json()
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }, [])

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

  return {
    companies,
    selectedCompany,
    editModalOpen,
    actionMenuOpen,
    loading,
    handleAction,
    handleUpdateCompany,
    handleMenuClick,
    handleMenuToggle,
    handleModalClose,
    fetchCompanies
  }
}