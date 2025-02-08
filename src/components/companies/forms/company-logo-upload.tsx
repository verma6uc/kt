"use client"

import { ImagePlus, Upload } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface CompanyLogoUploadProps {
  initialUrl?: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function CompanyLogoUpload({ 
  initialUrl, 
  onChange, 
  disabled = false 
}: CompanyLogoUploadProps) {
  const { data: session } = useSession()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      const { url } = await response.json()
      onChange(url)

      // Create audit log for logo upload
      await fetch('/api/audit/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logo_upload',
          details: `Company logo uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
          user_agent: navigator.userAgent
        }),
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      // Handle error (could show toast notification)
    }
  }

  return (
    <div>
      <div className="flex items-center space-x-6">
        {initialUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
            <img
              src={initialUrl}
              alt="Company logo"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <ImagePlus className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <label className="relative flex cursor-pointer items-center space-x-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
          <Upload className="h-5 w-5" />
          <span>{initialUrl ? 'Change logo' : 'Upload logo'}</span>
          <input
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        PNG, JPG, GIF up to 10MB
      </p>
    </div>
  )
}