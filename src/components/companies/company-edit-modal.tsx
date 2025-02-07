"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CompanyEditForm } from './forms/company-edit-form'
import { Company } from '@/types/company'
import { CompanyFormData } from '@/types/company-forms'

interface CompanyEditModalProps {
  isOpen: boolean
  company: Company
  onClose: () => void
  onSuccess: () => void
}

export function CompanyEditModal({ isOpen, company, onClose, onSuccess }: CompanyEditModalProps) {
  const handleSubmit = async (formData: CompanyFormData) => {
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
          // TODO: Handle contact info and address updates
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update company')
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating company:', error)
      // Error will be handled by the form component
      throw error
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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