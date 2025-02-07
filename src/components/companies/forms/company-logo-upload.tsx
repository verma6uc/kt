"use client"

import { Upload } from 'lucide-react'

interface CompanyLogoUploadProps {
  logoPreview: string
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export function CompanyLogoUpload({ logoPreview, onLogoChange, disabled }: CompanyLogoUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Company Logo
      </label>
      <div className="mt-1 flex items-center space-x-4">
        <div className="h-16 w-16 rounded-lg border border-gray-300 overflow-hidden">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onLogoChange}
          disabled={disabled}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  )
}