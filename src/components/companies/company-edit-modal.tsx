"use client"

import { useState, useRef, useEffect } from 'react'
import { X, AlertCircle, Upload } from 'lucide-react'
import { Company } from '@/types/company'
import clsx from 'clsx'

interface CompanyEditModalProps {
  company: Company
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: Partial<Company>) => Promise<void>
}

export default function CompanyEditModal({ company, isOpen, onClose, onUpdate }: CompanyEditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState(company.name)
  const [identifier, setIdentifier] = useState(company.identifier)
  const [description, setDescription] = useState(company.description || '')
  const [website, setWebsite] = useState(company.website || '')
  const [type, setType] = useState(company.type)
  const [industry, setIndustry] = useState(company.industry || '')
  const [status, setStatus] = useState<Company['status']>(company.status)
  const [taxId, setTaxId] = useState(company.tax_id || '')
  const [registrationNumber, setRegistrationNumber] = useState(company.registration_number || '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('id', company.id.toString())
    formData.append('name', name)
    formData.append('identifier', identifier)
    formData.append('description', description)
    formData.append('website', website)
    formData.append('type', type)
    formData.append('industry', industry || '')
    formData.append('status', status)
    formData.append('tax_id', taxId)
    formData.append('registration_number', registrationNumber)
    if (logoFile) {
      formData.append('logo', logoFile)
    }

    try {
      const response = await fetch('/api/companies', {
        method: 'PATCH',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update company')
      }

      const updatedCompany = await response.json()
      await onUpdate(updatedCompany)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size must be less than 5MB')
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const canChangeStatus = (newStatus: Company['status']): boolean => {
    if (company.status === 'archived') return false
    
    switch (company.status) {
      case 'active':
        return newStatus === 'suspended' || newStatus === 'archived'
      case 'suspended':
        return newStatus === 'active' || newStatus === 'archived'
      case 'pending_setup':
        return newStatus === 'active'
      case 'inactive':
        return newStatus === 'archived'
      default:
        return false
    }
  }

  const getStatusDescription = (status: Company['status']): string => {
    switch (status) {
      case 'active':
        return 'Company is fully operational with all features enabled.'
      case 'suspended':
        return 'Temporarily disable company access. All user access will be blocked but data is preserved.'
      case 'inactive':
        return 'Company is no longer active. All access is disabled.'
      case 'archived':
        return 'Permanently archive the company. This action cannot be undone.'
      case 'pending_setup':
        return 'Company is in initial setup phase.'
      default:
        return ''
    }
  }

  const getStatusWarning = (newStatus: Company['status']): string | null => {
    switch (newStatus) {
      case 'suspended':
        return 'This will temporarily block all user access to the company.'
      case 'archived':
        return 'This action is permanent and cannot be undone. The company will be archived and all access will be permanently disabled.'
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div ref={modalRef} className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Edit Company Details
              </h3>
              <div className="mt-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Logo */}
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
                        onChange={handleLogoChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
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
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="https://"
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
                        onChange={(e) => setIndustry(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value as Company['type'])}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        <option value="small_business">Small Business</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="startup">Startup</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Company['status'])}
                        className={clsx(
                          "mt-1 block w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-1",
                          company.status === 'archived'
                            ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        )}
                        disabled={company.status === 'archived'}
                      >
                        <option value="active" disabled={!canChangeStatus('active')}>Active</option>
                        <option value="suspended" disabled={!canChangeStatus('suspended')}>Suspended</option>
                        <option value="inactive" disabled={!canChangeStatus('inactive')}>Inactive</option>
                        <option value="archived" disabled={!canChangeStatus('archived')}>Archived</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        {getStatusDescription(status)}
                      </p>
                      {getStatusWarning(status) && (
                        <p className="mt-1 text-sm text-amber-600">
                          ⚠️ {getStatusWarning(status)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Registration Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                        Tax ID
                      </label>
                      <input
                        type="text"
                        id="taxId"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            {error}
                          </h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={loading || company.status === 'archived'}
                      className={clsx(
                        "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto",
                        loading || company.status === 'archived'
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      )}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}