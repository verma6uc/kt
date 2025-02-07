"use client"

import { useState } from 'react'
import { useToast } from '@/components/providers/toast-provider'
import { Plus, X, Upload } from 'lucide-react'
import Image from 'next/image'

interface CompanyCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: FormData) => Promise<void>
}

export function CompanyCreateModal({
  isOpen,
  onClose,
  onCreate
}: CompanyCreateModalProps) {
  const [name, setName] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast({
          type: 'error',
          title: 'File too large',
          message: 'Please select an image under 5MB'
        })
        return
      }
      if (!file.type.startsWith('image/')) {
        showToast({
          type: 'error',
          title: 'Invalid file type',
          message: 'Please select an image file'
        })
        return
      }
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Company name is required'
      })
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', name)
      if (logo) {
        formData.append('logo', logo)
      }
      await onCreate(formData)
      handleClose()
      showToast({
        type: 'success',
        title: 'Company Created',
        message: 'New company has been created successfully'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create company'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setLogo(null)
    setLogoPreview(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create New Company</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      className="object-contain rounded-lg"
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {logo ? 'Change Logo' : 'Upload Logo'}
                    </div>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Company
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}