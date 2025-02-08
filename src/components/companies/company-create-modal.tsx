"use client"

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CompanyLogoUpload } from './forms/company-logo-upload'
import { useToast } from '@/components/providers/toast-provider'
import { Building2, X } from 'lucide-react'

interface CompanyCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompanyCreateModal({ isOpen, onClose, onSuccess }: CompanyCreateModalProps) {
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const generateIdentifier = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  const handleSubmit = async () => {
    setError('')
    
    if (!name.trim()) {
      setError('Company name is required')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          identifier: generateIdentifier(name),
          logo_url: logoUrl,
          status: 'pending_setup',
          type: 'small_business'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create company')
      }

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Company created successfully'
      })
      onSuccess()
    } catch (error) {
      console.error('Error creating company:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create company'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setName('')
    setLogoUrl('')
    setError('')
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Building2 className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Create New Company
                    </Dialog.Title>
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Company Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Building2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          setError('')
                        }}
                        className={`block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ${
                          error
                            ? 'ring-red-300 placeholder:text-red-300 focus:ring-red-500'
                            : 'ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500'
                        } focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6`}
                        placeholder="Enter company name"
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? 'name-error' : undefined}
                      />
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600" id="name-error">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Company Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      Company Logo
                    </label>
                    <div className="mt-2">
                      <CompanyLogoUpload
                        initialUrl={logoUrl}
                        onChange={setLogoUrl}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !name.trim()}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Company'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}