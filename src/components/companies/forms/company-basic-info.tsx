"use client"

import { CompanyBasicInfo as CompanyBasicInfoType, CompanyBasicInfoProps } from '@/types/company-forms'
import { Multiselect } from '@/components/ui/multiselect'

const typeOptions = [
  { label: 'Enterprise', value: 'enterprise' },
  { label: 'Small Business', value: 'small_business' },
  { label: 'Startup', value: 'startup' }
]

export function CompanyBasicInfo({ initialData, onChange }: CompanyBasicInfoProps) {
  const handleChange = (field: keyof CompanyBasicInfoType, value: string) => {
    onChange({ ...initialData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            value={initialData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
          Company Identifier
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="identifier"
            value={initialData.identifier || ''}
            onChange={(e) => handleChange('identifier', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          A unique identifier for your company. This will be used in URLs and API calls.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            rows={3}
            value={initialData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="website"
            value={initialData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <Multiselect
          label="Company Type"
          options={typeOptions}
          value={[initialData.type || 'small_business']}
          onChange={(values) => handleChange('type', values[0])}
          placeholder="Select company type"
        />
      </div>
    </div>
  )
}