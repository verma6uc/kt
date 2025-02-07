"use client"

import { Company } from "@/types/company"
import clsx from "clsx"

interface CompanyBusinessInfoProps {
  type: Company['type']
  status: Company['status']
  onTypeChange: (value: Company['type']) => void
  onStatusChange: (value: Company['status']) => void
  disabled?: boolean
  currentStatus: Company['status']
}

export function CompanyBusinessInfo({
  type,
  status,
  onTypeChange,
  onStatusChange,
  disabled,
  currentStatus
}: CompanyBusinessInfoProps) {
  const canChangeStatus = (newStatus: Company['status']): boolean => {
    if (currentStatus === 'archived') return false
    
    switch (currentStatus) {
      case 'active':
        return newStatus === 'suspended' || newStatus === 'archived'
      case 'suspended':
        return newStatus === 'active' || newStatus === 'archived'
      case 'pending_setup':
        return newStatus === 'active'
      case 'inactive':
        return newStatus === 'archived'
      default:
        return false
    }
  }

  const getStatusDescription = (status: Company['status']): string => {
    switch (status) {
      case 'active':
        return 'Company is fully operational with all features enabled.'
      case 'suspended':
        return 'Temporarily disable company access. All user access will be blocked but data is preserved.'
      case 'inactive':
        return 'Company is no longer active. All access is disabled.'
      case 'archived':
        return 'Permanently archive the company. This action cannot be undone.'
      case 'pending_setup':
        return 'Company is in initial setup phase.'
      default:
        return ''
    }
  }

  const getStatusWarning = (newStatus: Company['status']): string | null => {
    switch (newStatus) {
      case 'suspended':
        return 'This will temporarily block all user access to the company.'
      case 'archived':
        return 'This action is permanent and cannot be undone. The company will be archived and all access will be permanently disabled.'
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value as Company['type'])}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          required
          disabled={disabled}
        >
          <option value="small_business">Small Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="startup">Startup</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as Company['status'])}
          className={clsx(
            "mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-1",
            currentStatus === 'archived'
              ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          )}
          disabled={disabled || currentStatus === 'archived'}
        >
          <option value="active" disabled={!canChangeStatus('active')}>Active</option>
          <option value="suspended" disabled={!canChangeStatus('suspended')}>Suspended</option>
          <option value="inactive" disabled={!canChangeStatus('inactive')}>Inactive</option>
          <option value="archived" disabled={!canChangeStatus('archived')}>Archived</option>
          <option value="pending_setup" disabled>Pending Setup</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {getStatusDescription(status)}
        </p>
        {getStatusWarning(status) && (
          <p className="mt-1 text-sm text-amber-600">
            ⚠️ {getStatusWarning(status)}
          </p>
        )}
      </div>
    </div>
  )
}