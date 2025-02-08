"use client"

import { useState, useEffect } from 'react'
import { Company } from '@/types/company'
import { CompanyBasicInfo } from './company-basic-info'
import { CompanyBusinessInfo } from './company-business-info'
import { CompanyContactInfo } from './company-contact-info'
import { CompanyRegistrationInfo } from './company-registration-info'
import { CompanyLogoUpload } from './company-logo-upload'
import { CompanyFormData, ValidationErrors, companyFormSchema } from '@/types/company-forms'
import { z } from 'zod'

interface CompanyEditFormProps {
  company: Company
  onSubmit: (data: CompanyFormData) => void
  onDirtyStateChange?: (isDirty: boolean) => void
  disabled?: boolean
}

export function CompanyEditForm({ 
  company, 
  onSubmit, 
  onDirtyStateChange,
  disabled = false 
}: CompanyEditFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    basicInfo: {
      name: company.name,
      identifier: company.identifier,
      description: company.description || '',
      website: company.website || '',
      type: company.type
    },
    businessInfo: {
      industry: company.industry || '',
      employee_count: company.employee_count || 0,
      status: company.status
    },
    contactInfo: {
      email: company.contact?.email || '',
      phone: company.contact?.phone || '',
      address: {
        street: company.contact?.address?.street || '',
        city: company.contact?.address?.city || '',
        country: company.contact?.address?.country || '',
        postal_code: company.contact?.address?.postal_code || ''
      }
    },
    registrationInfo: {
      tax_id: company.tax_id || '',
      registration_number: company.registration_number || ''
    },
    logoUrl: company.logo_url || ''
  })

  const [errors, setErrors] = useState<ValidationErrors | null>(null)

  // Track form dirty state
  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify({
      basicInfo: {
        name: company.name,
        identifier: company.identifier,
        description: company.description || '',
        website: company.website || '',
        type: company.type
      },
      businessInfo: {
        industry: company.industry || '',
        employee_count: company.employee_count || 0,
        status: company.status
      },
      contactInfo: {
        email: company.contact?.email || '',
        phone: company.contact?.phone || '',
        address: {
          street: company.contact?.address?.street || '',
          city: company.contact?.address?.city || '',
          country: company.contact?.address?.country || '',
          postal_code: company.contact?.address?.postal_code || ''
        }
      },
      registrationInfo: {
        tax_id: company.tax_id || '',
        registration_number: company.registration_number || ''
      },
      logoUrl: company.logo_url || ''
    })

    onDirtyStateChange?.(isDirty)
  }, [formData, company, onDirtyStateChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form data
    const result = companyFormSchema.safeParse(formData)
    if (!result.success) {
      const formErrors: string[] = []
      const fieldErrors: Record<string, string[]> = {}

      result.error.errors.forEach((error) => {
        const path = error.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = []
        }
        fieldErrors[path].push(error.message)
      })

      setErrors({ formErrors, fieldErrors })
      return
    }

    setErrors(null)
    onSubmit(formData)
  }

  const getErrorsForSection = (section: keyof CompanyFormData): ValidationErrors | undefined => {
    if (!errors) return undefined

    const sectionErrors: ValidationErrors = {
      formErrors: [],
      fieldErrors: {}
    }

    Object.entries(errors.fieldErrors).forEach(([path, messages]) => {
      if (path.startsWith(section)) {
        const fieldName = path.split('.').slice(1).join('.')
        sectionErrors.fieldErrors[fieldName] = messages
      }
    })

    return sectionErrors
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
          <div className="mt-6">
            <CompanyBasicInfo
              initialData={formData.basicInfo}
              onChange={(data) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, ...data } })}
              errors={getErrorsForSection('basicInfo')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Business Information</h3>
          <div className="mt-6">
            <CompanyBusinessInfo
              initialData={formData.businessInfo}
              onChange={(data) => setFormData({ ...formData, businessInfo: { ...formData.businessInfo, ...data } })}
              errors={getErrorsForSection('businessInfo')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Information</h3>
          <div className="mt-6">
            <CompanyContactInfo
              initialData={formData.contactInfo}
              onChange={(data) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, ...data } })}
              errors={getErrorsForSection('contactInfo')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Registration Information</h3>
          <div className="mt-6">
            <CompanyRegistrationInfo
              initialData={formData.registrationInfo}
              onChange={(data) => setFormData({ ...formData, registrationInfo: { ...formData.registrationInfo, ...data } })}
              errors={getErrorsForSection('registrationInfo')}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Company Logo</h3>
          <div className="mt-6">
            <CompanyLogoUpload
              initialUrl={formData.logoUrl}
              onChange={(url) => setFormData({ ...formData, logoUrl: url })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}