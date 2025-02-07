"use client"

import { Notification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCircle, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface NotificationsTableProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationsTable({
  notifications,
  onMarkAsRead,
  onDelete
}: NotificationsTableProps) {
  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Notification
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {notifications.map((notification) => (
                  <tr key={notification.id} className={notification.status === 'unread' ? 'bg-blue-50' : undefined}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <Bell className={`h-5 w-5 flex-shrink-0 ${
                          notification.status === 'unread' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{notification.title}</div>
                          <div className="text-gray-500">{notification.message}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        notification.priority === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : notification.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        notification.status === 'unread'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.status === 'unread' ? (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Unread
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Read
                          </>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end space-x-4">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            View
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        )}
                        {notification.status === 'unread' && (
                          <button
                            onClick={() => onMarkAsRead(notification.id.toString())}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(notification.id.toString())}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}