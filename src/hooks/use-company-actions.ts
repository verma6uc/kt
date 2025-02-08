"use client"

import { useState } from 'react'
import { useToast } from '@/components/providers/toast-provider'
import { Company } from '@/types/company'

export function useCompanyActions() {
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const updateCompanyStatus = async (company: Company, newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update company status')
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Company status updated successfully'
      })

      return true
    } catch (error) {
      console.error('Error updating company status:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update company status'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  const getAvailableActions = (status: string) => {
    switch (status) {
      case 'pending_setup':
        return [
          { label: 'Mark as Inactive', value: 'inactive' }
        ]
      case 'active':
        return [
          { label: 'Suspend', value: 'suspended' },
          { label: 'Deactivate', value: 'inactive' }
        ]
      case 'suspended':
        return [
          { label: 'Reactivate', value: 'active' },
          { label: 'Deactivate', value: 'inactive' }
        ]
      case 'inactive':
        return [
          { label: 'Reactivate', value: 'active' }
        ]
      default:
        return []
    }
  }

  return {
    loading,
    updateCompanyStatus,
    getAvailableActions
  }
}