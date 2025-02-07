"use client"

import { CompanyBusinessInfo as CompanyBusinessInfoType, CompanyBusinessInfoProps } from '@/types/company-forms'
import { Multiselect } from '@/components/ui/multiselect'

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Pending Setup', value: 'pending_setup' }
]

const industryOptions = [
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Finance', value: 'finance' },
  { label: 'Education', value: 'education' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Retail', value: 'retail' },
  { label: 'Other', value: 'other' }
]

export function CompanyBusinessInfo({ initialData, onChange }: CompanyBusinessInfoProps) {
  const handleChange = (field: keyof CompanyBusinessInfoType, value: string | number) => {
    onChange({ ...initialData, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Multiselect
          label="Industry"
          options={industryOptions}
          value={initialData.industry ? [initialData.industry] : []}
          onChange={(values) => handleChange('industry', values[0])}
          placeholder="Select industry"
        />
      </div>

      <div>
        <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700">
          Number of Employees
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="employee_count"
            value={initialData.employee_count || ''}
            onChange={(e) => handleChange('employee_count', parseInt(e.target.value) || 0)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <Multiselect
          label="Status"
          options={statusOptions}
          value={[initialData.status || 'pending_setup']}
          onChange={(values) => handleChange('status', values[0])}
          placeholder="Select status"
        />
        <p className="mt-2 text-sm text-gray-500">
          The company status affects what features and capabilities are available.
        </p>
      </div>
    </div>
  )
}