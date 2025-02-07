"use client"

interface CompanyBasicInfoProps {
  name: string
  identifier: string
  description: string
  onNameChange: (value: string) => void
  onIdentifierChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  disabled?: boolean
}

export function CompanyBasicInfo({
  name,
  identifier,
  description,
  onNameChange,
  onIdentifierChange,
  onDescriptionChange,
  disabled
}: CompanyBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={disabled}
          />
        </div>

        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
            Identifier
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  )
}