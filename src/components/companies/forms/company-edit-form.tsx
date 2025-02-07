"use client"

import { useState, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { Company } from '@/types/company'
import { CompanyLogoUpload } from './company-logo-upload'
import { CompanyBasicInfo } from './company-basic-info'
import { CompanyContactInfo } from './company-contact-info'
import { CompanyBusinessInfo } from './company-business-info'
import { CompanyRegistrationInfo } from './company-registration-info'

interface CompanyEditFormProps {
  company: Company
  onSubmit: (data: Partial<Company>) => Promise<void>
  disabled?: boolean
  error?: string
}

export function CompanyEditForm({ company, onSubmit, disabled, error }: CompanyEditFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState(error || '')

  // Form state
  const [name, setName] = useState(company.name)
  const [identifier, setIdentifier] = useState(company.identifier)
  const [description, setDescription] = useState(company.description || '')
  const [website, setWebsite] = useState(company.website || '')
  const [type, setType] = useState(company.type)
  const [industry, setIndustry] = useState(company.industry || '')
  const [status, setStatus] = useState<Company['status']>(company.status)
  const [taxId, setTaxId] = useState(company.tax_id || '')
  const [registrationNumber, setRegistrationNumber] = useState(company.registration_number || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setFormError('Logo file size must be less than 5MB')
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError('')

    try {
      await onSubmit({
        name,
        identifier,
        description: description || null,
        website: website || null,
        type,
        industry: industry || null,
        status,
        tax_id: taxId || null,
        registration_number: registrationNumber || null,
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update company')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <CompanyLogoUpload
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        disabled={disabled || loading}
      />

      <CompanyBasicInfo
        name={name}
        identifier={identifier}
        description={description}
        onNameChange={setName}
        onIdentifierChange={setIdentifier}
        onDescriptionChange={setDescription}
        disabled={disabled || loading}
      />

      <CompanyContactInfo
        website={website}
        industry={industry}
        onWebsiteChange={setWebsite}
        onIndustryChange={setIndustry}
        disabled={disabled || loading}
      />

      <CompanyBusinessInfo
        type={type}
        status={status}
        onTypeChange={setType}
        onStatusChange={setStatus}
        disabled={disabled || loading}
        currentStatus={company.status}
      />

      <CompanyRegistrationInfo
        taxId={taxId}
        registrationNumber={registrationNumber}
        onTaxIdChange={setTaxId}
        onRegistrationNumberChange={setRegistrationNumber}
        disabled={disabled || loading}
      />

      {/* Error Message */}
      {(formError || error) && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {formError || error}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={disabled || loading}
          className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}