"use client"

import { CompanyRegistrationInfo as CompanyRegistrationInfoType, CompanyRegistrationInfoProps } from '@/types/company-forms'

export function CompanyRegistrationInfo({ initialData, onChange }: CompanyRegistrationInfoProps) {
  const handleChange = (field: keyof CompanyRegistrationInfoType, value: string) => {
    onChange({ ...initialData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
          Tax ID
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="tax_id"
            value={initialData.tax_id || ''}
            onChange={(e) => handleChange('tax_id', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your company's tax identification number.
        </p>
      </div>

      <div>
        <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
          Registration Number
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="registration_number"
            value={initialData.registration_number || ''}
            onChange={(e) => handleChange('registration_number', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your company's official registration or incorporation number.
        </p>
      </div>
    </div>
  )
}