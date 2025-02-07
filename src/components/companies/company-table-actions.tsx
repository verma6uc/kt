"use client"

import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { MoreVertical, Edit, Trash, Lock, Settings, Play, Pause } from "lucide-react"
import clsx from "clsx"
import Link from "next/link"

interface Company {
  id: number
  name: string
  type: 'small_business' | 'enterprise' | 'startup'
  status: 'pending_setup' | 'active' | 'suspended' | 'inactive'
}

interface CompanyTableActionsProps {
  company: Company
}

export function CompanyTableActions({ company }: CompanyTableActionsProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <span className="sr-only">Open options</span>
          <MoreVertical className="h-5 w-5" aria-hidden="true" />
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
                <Link
                  href={`/dashboard/companies/${company.id}/edit`}
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <Edit
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Edit
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href={`/dashboard/companies/${company.id}/settings`}
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <Settings
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Settings
                </Link>
              )}
            </Menu.Item>
            {company.status === 'active' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex w-full items-center px-4 py-2 text-sm'
                    )}
                  >
                    <Pause
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Suspend
                  </button>
                )}
              </Menu.Item>
            )}
            {company.status === 'suspended' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'group flex w-full items-center px-4 py-2 text-sm'
                    )}
                  >
                    <Play
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Activate
                  </button>
                )}
              </Menu.Item>
            )}
            {company.status !== 'active' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={clsx(
                      active ? 'bg-gray-100 text-red-900' : 'text-red-700',
                      'group flex w-full items-center px-4 py-2 text-sm'
                    )}
                  >
                    <Trash
                      className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500"
                      aria-hidden="true"
                    />
                    Delete
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}