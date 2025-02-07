"use client"

import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Company } from '@/types/company'
import { CompanyEditForm } from './forms/company-edit-form'

interface CompanyEditModalProps {
  company: Company
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: Partial<Company>) => Promise<void>
}

export default function CompanyEditModal({ company, isOpen, onClose, onUpdate }: CompanyEditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside
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
              <div className="mt-4">
                <CompanyEditForm
                  company={company}
                  onSubmit={onUpdate}
                  disabled={company.status === 'archived'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}