"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CompanyBasicInfo } from './forms/company-basic-info'
import { CompanyBusinessInfo } from './forms/company-business-info'
import { CompanyContactInfo } from './forms/company-contact-info'
import { CompanyRegistrationInfo } from './forms/company-registration-info'
import { CompanyLogoUpload } from './forms/company-logo-upload'
import { useState } from 'react'
import { useToast } from '@/components/providers/toast-provider'
import { CompanyFormData } from '@/types/company-forms'

interface CompanyCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompanyCreateModal({ isOpen, onClose, onSuccess }: CompanyCreateModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CompanyFormData>({
    basicInfo: {
      name: '',
      identifier: '',
      type: 'small_business'
    },
    businessInfo: {
      status: 'pending_setup'
    },
    contactInfo: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        country: '',
        postal_code: ''
      }
    },
    registrationInfo: {},
    logoUrl: ''
  })
  const { showToast } = useToast()

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData.basicInfo,
          ...formData.businessInfo,
          ...formData.contactInfo,
          ...formData.registrationInfo,
          logo_url: formData.logoUrl
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create company')
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating company:', error)
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create company'
      })
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Company
                  </Dialog.Title>

                  <div className="mt-6">
                    {step === 1 && (
                      <CompanyBasicInfo
                        initialData={formData.basicInfo}
                        onChange={(data) => setFormData({ ...formData, basicInfo: { ...formData.basicInfo, ...data } })}
                      />
                    )}
                    {step === 2 && (
                      <CompanyBusinessInfo
                        initialData={formData.businessInfo}
                        onChange={(data) => setFormData({ ...formData, businessInfo: { ...formData.businessInfo, ...data } })}
                      />
                    )}
                    {step === 3 && (
                      <CompanyContactInfo
                        initialData={formData.contactInfo}
                        onChange={(data) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, ...data } })}
                      />
                    )}
                    {step === 4 && (
                      <CompanyRegistrationInfo
                        initialData={formData.registrationInfo}
                        onChange={(data) => setFormData({ ...formData, registrationInfo: { ...formData.registrationInfo, ...data } })}
                      />
                    )}
                    {step === 5 && (
                      <CompanyLogoUpload
                        initialUrl={formData.logoUrl}
                        onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                      />
                    )}
                  </div>
                </div>

                <div className="mt-8 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  {step > 1 && (
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                      onClick={handleBack}
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    onClick={step === 5 ? handleSubmit : handleNext}
                  >
                    {step === 5 ? 'Create Company' : 'Next'}
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