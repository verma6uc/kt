"use client"

import { Fragment } from "react"
import { Menu, Transition } from "@headlessui/react"
import { Bell, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"
import clsx from "clsx"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    updateNotificationStatus,
    markAllAsRead 
  } = useNotifications()

  const handleNotificationClick = async (id: number) => {
    await updateNotificationStatus(id, 'read')
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative rounded-full p-1 hover:bg-gray-100 focus:outline-none">
        <Bell className="h-6 w-6 text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
            {unreadCount}
          </span>
        )}
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    {({ active }) => (
                      <Link
                        href={notification.link || '/dashboard/notifications'}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={clsx(
                          active ? "bg-gray-50" : "",
                          "block px-4 py-3 cursor-pointer"
                        )}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {notification.status === 'unread' && (
                            <div className="ml-4 flex-shrink-0">
                              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              href="/dashboard/notifications"
              className="block text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </Link>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}