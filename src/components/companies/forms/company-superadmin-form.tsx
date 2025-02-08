"use client"

import { useEffect, useState } from 'react'
import { Company } from '@/types/company'
import { CompanyLogoUpload } from './company-logo-upload'
import { Building2 } from 'lucide-react'

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name Input */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Company Name <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Building2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ${
              errors.name
                ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500'
            } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
            placeholder="Enter company name"
            disabled={disabled}
            autoComplete="organization"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600" id="name-error">
              {errors.name}
            </p>
          )}
        </div>
      </div>

      {/* Company Identifier */}
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-900">
          Identifier <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value.toUpperCase() })}
            className={`block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ${
              errors.identifier
                ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500'
            } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 uppercase`}
            placeholder="COMPANY-ID"
            pattern="[A-Z0-9-]+"
            maxLength={20}
            disabled={disabled}
            aria-invalid={errors.identifier ? 'true' : 'false'}
            aria-describedby={errors.identifier ? 'identifier-error' : 'identifier-description'}
          />
          {errors.identifier && (
            <p className="mt-2 text-sm text-red-600" id="identifier-error">
              {errors.identifier}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500" id="identifier-description">
            Must contain only uppercase letters, numbers, and hyphens (e.g., ACME-123)
          </p>
        </div>
      </div>

      {/* Company Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-900">
          Company Logo
        </label>
        <div className="mt-2">
          <CompanyLogoUpload
            initialUrl={formData.logo_url || ''}
            onChange={(url) => setFormData({ ...formData, logo_url: url })}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
          onClick={() => onDirtyStateChange(false)}
          disabled={disabled}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
        >
          {disabled ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}