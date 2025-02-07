"use client"

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { CompanyLogoUploadProps } from '@/types/company-forms'

export function CompanyLogoUpload({ initialUrl, onChange }: CompanyLogoUploadProps) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      // Create unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 12).toUpperCase()
      const filename = `company-${randomId}-${timestamp}${file.name.substring(file.name.lastIndexOf('.'))}`

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filename', filename)

      // Upload file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      const logoUrl = `/uploads/${filename}`

      setPreviewUrl(logoUrl)
      onChange(logoUrl)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl('')
    onChange('')
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Company logo"
            className="h-32 w-32 rounded-lg object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-400 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="sr-only">Remove logo</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="logo-upload"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Upload a logo</span>
                <input
                  id="logo-upload"
                  name="logo-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      )}
    </div>
  )
}