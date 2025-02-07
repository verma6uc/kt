"use client"

interface CompanyRegistrationInfoProps {
  taxId: string
  registrationNumber: string
  onTaxIdChange: (value: string) => void
  onRegistrationNumberChange: (value: string) => void
  disabled?: boolean
}

export function CompanyRegistrationInfo({
  taxId,
  registrationNumber,
  onTaxIdChange,
  onRegistrationNumberChange,
  disabled
}: CompanyRegistrationInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
          Tax ID
        </label>
        <input
          type="text"
          id="taxId"
          value={taxId}
          onChange={(e) => onTaxIdChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
          Registration Number
        </label>
        <input
          type="text"
          id="registrationNumber"
          value={registrationNumber}
          onChange={(e) => onRegistrationNumberChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  )
}