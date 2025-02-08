"use client"

import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X as XMarkIcon } from 'lucide-react'
import { CompanyEditForm } from './forms/company-edit-form'
import { Company } from '@/types/company'
import { CompanyFormData } from '@/types/company-forms'
import { toast } from 'react-hot-toast'

interface CompanyEditModalProps {
  isOpen: boolean
  company: Company
  onClose: () => void
  onSuccess: () => void
}

export function CompanyEditModal({ isOpen, company, onClose, onSuccess }: CompanyEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsDirty(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async (formData: CompanyFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading('Updating company...')
    
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.basicInfo.name,
          identifier: formData.basicInfo.identifier,
          description: formData.basicInfo.description,
          website: formData.basicInfo.website,
          type: formData.basicInfo.type,
          industry: formData.businessInfo.industry,
          employee_count: formData.businessInfo.employee_count,
          status: formData.businessInfo.status,
          tax_id: formData.registrationInfo.tax_id,
          registration_number: formData.registrationInfo.registration_number,
          logo_url: formData.logoUrl,
          contact: {
            email: formData.contactInfo.email,
            phone: formData.contactInfo.phone,
            address: {
              street: formData.contactInfo.address.street,
              city: formData.contactInfo.address.city,
              country: formData.contactInfo.address.country,
              postal_code: formData.contactInfo.address.postal_code
            }
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update company')
      }

      toast.success('Company updated successfully', { id: toastId })
      setIsDirty(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating company:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update company', { id: toastId })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit Company
                  </Dialog.Title>

                  <div className="mt-6">
                    <CompanyEditForm
                      company={company}
                      onSubmit={handleSubmit}
                      onDirtyStateChange={setIsDirty}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}