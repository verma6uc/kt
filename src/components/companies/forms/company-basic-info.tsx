"use client"

import { CompanyBasicInfo as CompanyBasicInfoType, CompanyBasicInfoProps } from '@/types/company-forms'
import { Multiselect } from '@/components/ui/multiselect'

const typeOptions = [
  { label: 'Enterprise', value: 'enterprise' },
  { label: 'Small Business', value: 'small_business' },
  { label: 'Startup', value: 'startup' }
]

export function CompanyBasicInfo({ initialData, onChange, errors }: CompanyBasicInfoProps) {
  const handleChange = (field: keyof CompanyBasicInfoType, value: string) => {
    onChange({ ...initialData, [field]: value })
  }

  const getFieldError = (field: string) => {
    if (!errors?.fieldErrors) return undefined
    return errors.fieldErrors[field]?.[0]
  }

  const formErrors = errors?.formErrors || []

  return (
    <div className="space-y-6">
      {formErrors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">There were errors with your submission</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              getFieldError('name')
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!getFieldError('name')}
            aria-describedby={getFieldError('name') ? 'name-error' : undefined}
          />
        </div>
        {getFieldError('name') && (
          <p className="mt-2 text-sm text-red-600" id="name-error">
            {getFieldError('name')}
          </p>
        )}
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
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              getFieldError('identifier')
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!getFieldError('identifier')}
            aria-describedby={getFieldError('identifier') ? 'identifier-error' : undefined}
          />
        </div>
        {getFieldError('identifier') ? (
          <p className="mt-2 text-sm text-red-600" id="identifier-error">
            {getFieldError('identifier')}
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            A unique identifier for your company. This will be used in URLs and API calls.
          </p>
        )}
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
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              getFieldError('description')
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!getFieldError('description')}
            aria-describedby={getFieldError('description') ? 'description-error' : undefined}
          />
        </div>
        {getFieldError('description') && (
          <p className="mt-2 text-sm text-red-600" id="description-error">
            {getFieldError('description')}
          </p>
        )}
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
            className={`block w-full rounded-md shadow-sm sm:text-sm ${
              getFieldError('website')
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!getFieldError('website')}
            aria-describedby={getFieldError('website') ? 'website-error' : undefined}
          />
        </div>
        {getFieldError('website') && (
          <p className="mt-2 text-sm text-red-600" id="website-error">
            {getFieldError('website')}
          </p>
        )}
      </div>

      <div>
        <Multiselect
          label="Company Type"
          options={typeOptions}
          value={[initialData.type || 'small_business']}
          onChange={(values) => handleChange('type', values[0])}
          placeholder="Select company type"
          error={getFieldError('type')}
        />
      </div>
    </div>
  )
}