"use client"

import { useRouter } from 'next/navigation'
import { 
  MoreHorizontal, 
  Edit, 
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
  Ban,
  Power,
  XCircle
} from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Company } from '@/types/company'
import { useCompanyActions } from '@/hooks/use-company-actions'

interface CompanyTableActionsProps {
  company: Company
  onEdit: (company: Company) => void
  onStatusChange?: () => void
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'active':
      return <Power className="mr-3 h-4 w-4 text-green-500" />
    case 'suspended':
      return <Ban className="mr-3 h-4 w-4 text-red-500" />
    case 'inactive':
      return <XCircle className="mr-3 h-4 w-4 text-gray-500" />
    default:
      return null
  }
}

export function CompanyTableActions({ company, onEdit, onStatusChange }: CompanyTableActionsProps) {
  const router = useRouter()
  const { loading, updateCompanyStatus, getAvailableActions } = useCompanyActions()
  const actions = getAvailableActions(company.status)

  const handleStatusChange = async (newStatus: string) => {
    if (loading) return
    const success = await updateCompanyStatus(company, newStatus)
    if (success && onStatusChange) {
      onStatusChange()
    }
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center text-gray-400 hover:text-gray-600">
          <span className="sr-only">Open options</span>
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push(`/dashboard/companies/${company.id}`)}
                  className={`
                    ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                    group flex w-full items-center px-4 py-2 text-sm
                  `}
                >
                  <Eye
                    className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  View Details
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onEdit(company)}
                  className={`
                    ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                    group flex w-full items-center px-4 py-2 text-sm
                  `}
                >
                  <Edit
                    className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Edit
                </button>
              )}
            </Menu.Item>

            {actions.length > 0 && (
              <div className="border-t border-gray-100">
                {actions.map((action) => (
                  <Menu.Item key={action.value}>
                    {({ active }) => (
                      <button
                        onClick={() => handleStatusChange(action.value)}
                        disabled={loading}
                        className={`
                          ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}
                          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                          group flex w-full items-center px-4 py-2 text-sm
                        `}
                      >
                        {getActionIcon(action.value)}
                        {action.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}