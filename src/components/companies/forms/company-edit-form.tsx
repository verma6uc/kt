"use client"

import { useState } from 'react'
import { Company } from '@/types/company'
import { CompanyBasicInfo } from './company-basic-info'
import { CompanyBusinessInfo } from './company-business-info'
import { CompanyContactInfo } from './company-contact-info'
import { CompanyRegistrationInfo } from './company-registration-info'
import { CompanyLogoUpload } from './company-logo-upload'
import { CompanyFormData } from '@/types/company-forms'

interface CompanyEditFormProps {
  company: Company
  onSubmit: (data: CompanyFormData) => void
  disabled?: boolean
}

export function CompanyEditForm({ company, onSubmit, disabled = false }: CompanyEditFormProps) {
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
      email: '',  // TODO: Get from company contacts
      phone: '',  // TODO: Get from company contacts
      address: {
        street: '',  // TODO: Get from company address
        city: '',
        country: '',
        postal_code: ''
      }
    },
    registrationInfo: {
      tax_id: company.tax_id || '',
      registration_number: company.registration_number || ''
    },
    logoUrl: company.logo_url || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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