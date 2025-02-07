"use client"

import { MoreVertical, Edit, Archive, Ban } from 'lucide-react'
import { Company } from '@/types/company'
import clsx from 'clsx'

interface CompanyActionMenuProps {
  company: Company
  isOpen: boolean
  onToggle: () => void
  onAction: (action: 'edit' | 'suspend' | 'archive') => void
  onMenuClick: (e: React.MouseEvent) => void
}

export function CompanyActionMenu({ 
  company, 
  isOpen, 
  onToggle, 
  onAction,
  onMenuClick 
}: CompanyActionMenuProps) {
  return (
    <div className="relative">
      <button 
        className={clsx(
          "text-gray-400 hover:text-gray-500",
          isOpen && "text-gray-600"
        )}
        onClick={(e) => {
          onMenuClick(e)
          onToggle()
        }}
      >
        <MoreVertical className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <button
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={(e) => {
              onMenuClick(e)
              onAction('edit')
            }}
            disabled={company.status === 'archived'}
          >
            <Edit className="mr-3 h-4 w-4" />
            Edit Details
          </button>

          {company.status === 'active' && (
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
              onClick={(e) => {
                onMenuClick(e)
                onAction('suspend')
              }}
            >
              <Ban className="mr-3 h-4 w-4" />
              Suspend
            </button>
          )}

          {(company.status === 'active' || company.status === 'suspended') && (
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              onClick={(e) => {
                onMenuClick(e)
                onAction('archive')
              }}
            >
              <Archive className="mr-3 h-4 w-4" />
              Archive
            </button>
          )}
        </div>
      )}
    </div>
  )
}