"use client"

import { useEffect, useState } from 'react'
import { Company } from '@/types/company'
import { CompanyLogoUpload } from './company-logo-upload'

interface CompanySuperadminFormProps {
  company: Company
  onSubmit: (data: { name: string; identifier: string; logo_url: string | null }) => Promise<void>
  onDirtyStateChange: (isDirty: boolean) => void
  disabled?: boolean
}

export function CompanySuperadminForm({
  company,
  onSubmit,
  onDirtyStateChange,
  disabled = false
}: CompanySuperadminFormProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    identifier: company.identifier,
    logo_url: company.logo_url
  })

  const [errors, setErrors] = useState({
    name: '',
    identifier: ''
  })

  useEffect(() => {
    const isDirty = formData.name !== company.name ||
      formData.identifier !== company.identifier ||
      formData.logo_url !== company.logo_url
    onDirtyStateChange(isDirty)
  }, [formData, company, onDirtyStateChange])

  const validateForm = () => {
    const newErrors = {
      name: '',
      identifier: ''
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Identifier is required'
    } else if (!/^[A-Z0-9-]+$/.test(formData.identifier)) {
      newErrors.identifier = 'Identifier must contain only uppercase letters, numbers, and hyphens'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    await onSubmit({
      name: formData.name.trim(),
      identifier: formData.identifier.trim(),
      logo_url: formData.logo_url
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Company Logo
        </label>
        <div className="mt-1">
          <CompanyLogoUpload
            initialUrl={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Company Name <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`
              block w-full rounded-md shadow-sm sm:text-sm
              ${errors.name ? 'border-red-300' : 'border-gray-300'}
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition duration-150 ease-in-out
            `}
            placeholder="Enter company name"
            disabled={disabled}
            autoComplete="organization"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
      </div>

      {/* Company Identifier */}
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
          Identifier <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value.toUpperCase() })}
            className={`
              block w-full rounded-md shadow-sm sm:text-sm uppercase
              ${errors.identifier ? 'border-red-300' : 'border-gray-300'}
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition duration-150 ease-in-out
            `}
            placeholder="COMPANY-ID"
            pattern="[A-Z0-9-]+"
            maxLength={20}
            disabled={disabled}
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Must contain only uppercase letters, numbers, and hyphens (e.g., ACME-123)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className={`
            inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm
            ${disabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }
            transition-colors duration-150 ease-in-out
          `}
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}