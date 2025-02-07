"use client"

import { CompanyContactInfo as CompanyContactInfoType, CompanyContactInfoProps } from '@/types/company-forms'

type AddressField = keyof CompanyContactInfoType['address']

export function CompanyContactInfo({ initialData, onChange }: CompanyContactInfoProps) {
  const handleContactChange = (field: 'email' | 'phone', value: string) => {
    onChange({ ...initialData, [field]: value })
  }

  const handleAddressChange = (field: AddressField, value: string) => {
    const currentAddress = initialData.address || {
      street: '',
      city: '',
      country: '',
      postal_code: '',
    }

    onChange({
      ...initialData,
      address: {
        ...currentAddress,
        [field]: value
      }
    })
  }

  // Ensure address object exists
  const address = initialData.address || {
    street: '',
    city: '',
    country: '',
    postal_code: '',
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="mt-1">
          <input
            type="email"
            id="email"
            value={initialData.email || ''}
            onChange={(e) => handleContactChange('email', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <div className="mt-1">
          <input
            type="tel"
            id="phone"
            value={initialData.phone || ''}
            onChange={(e) => handleContactChange('phone', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="font-medium text-gray-900">Address</h4>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="street"
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="city"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State / Province
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="state"
                value={address.state || ''}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="country"
                value={address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="postal_code"
                value={address.postal_code}
                onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}