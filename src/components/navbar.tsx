"use client"

import { useSession, signOut } from "next-auth/react"
import { Menu, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { Settings, Shield, Key } from "lucide-react"
import NotificationsDropdown from "./notifications-dropdown"

function getInitials(email: string): string {
  // Remove everything after @ and split into words
  const name = email.split('@')[0].replace(/[^a-zA-Z ]/g, ' ').trim()
  const words = name.split(' ').filter(word => word.length > 0)
  
  if (words.length === 0) return email.slice(0, 2).toUpperCase()
  
  if (words.length === 1) {
    // If one word, take first two letters
    return words[0].slice(0, 2).toUpperCase()
  }
  
  // If multiple words, take first letter of first two words
  return (words[0][0] + words[1][0]).toUpperCase()
}

function getAvatarColor(email: string): string {
  // Generate a consistent color based on email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use hue rotation for consistent but varied colors
  const hue = hash % 360
  return `hsl(${hue}, 70%, 45%)`
}

export default function Navbar() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'
  const userEmail = session?.user?.email || ''
  const initials = getInitials(userEmail)
  const avatarColor = getAvatarColor(userEmail)

  return (
    <div className={`sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 ${
      isSuperAdmin ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-white'
    }`}>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1">
          {isSuperAdmin && (
            <div className="flex items-center">
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-white ${
                  isSuperAdmin ? 'ring-2 ring-white ring-opacity-20' : ''
                }`}
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {session?.user?.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <p className={`text-xs ${isSuperAdmin ? 'text-blue-600 font-medium' : 'text-gray-500'} capitalize flex items-center`}>
                          {isSuperAdmin && <Shield className="h-3 w-3 mr-1" />}
                          {session?.user?.role?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                
                {isSuperAdmin && (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          System Settings
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } flex w-full items-center px-3 py-2 text-sm text-gray-700`}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Access Control
                        </button>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut()}
                      className={`${
                        active ? "bg-gray-50" : ""
                      } flex w-full items-center px-3 py-2 text-sm text-red-600 hover:text-red-700`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  )
}