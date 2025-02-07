"use client"

interface CompanyContactInfoProps {
  website: string
  industry: string
  onWebsiteChange: (value: string) => void
  onIndustryChange: (value: string) => void
  disabled?: boolean
}

export function CompanyContactInfo({
  website,
  industry,
  onWebsiteChange,
  onIndustryChange,
  disabled
}: CompanyContactInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="https://"
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <input
          type="text"
          id="industry"
          value={industry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  )
}