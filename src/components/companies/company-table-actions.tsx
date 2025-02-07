"use client"

import { useRouter } from 'next/navigation'
import { MoreHorizontal, Edit, BarChart } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Company } from '@/types/company'

interface CompanyTableActionsProps {
  company: Company
  onEdit: (company: Company) => void
}

export function CompanyTableActions({ company, onEdit }: CompanyTableActionsProps) {
  const router = useRouter()

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
                  <BarChart
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  View Metrics
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
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Edit
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}