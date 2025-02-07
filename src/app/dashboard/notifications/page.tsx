"use client"

import { Fragment, useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationStatus, NotificationPriority, NotificationType } from "@/types/notification"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle, Clock, AlertCircle, Search, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Menu, Transition } from "@headlessui/react"
import clsx from "clsx"

const statusFilters: { name: string; value: NotificationStatus }[] = [
  { name: "Unread", value: "unread" },
  { name: "Read", value: "read" },
  { name: "Archived", value: "archived" },
]

const priorityFilters: { name: string; value: NotificationPriority }[] = [
  { name: "Low", value: "low" },
  { name: "Medium", value: "medium" },
  { name: "High", value: "high" },
]

const typeFilters: { name: string; value: NotificationType }[] = [
  { name: "Info", value: "info" },
  { name: "Warning", value: "warning" },
  { name: "Error", value: "error" },
  { name: "Success", value: "success" },
]

const priorityColors = {
  low: "text-gray-500",
  medium: "text-blue-500",
  high: "text-orange-500",
}

const ITEMS_PER_PAGE = 10

export default function NotificationsPage() {
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatus>("unread")
  const [selectedPriorities, setSelectedPriorities] = useState<Set<NotificationPriority>>(new Set())
  const [selectedTypes, setSelectedTypes] = useState<Set<NotificationType>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  const { notifications: allNotifications, loading, error, updateNotificationStatus, markAllAsRead } =
    useNotifications(selectedStatus)

  // Filter notifications based on selected filters and search query
  const filteredNotifications = allNotifications.filter(notification => {
    const matchesPriority = selectedPriorities.size === 0 || selectedPriorities.has(notification.priority)
    const matchesType = selectedTypes.size === 0 || selectedTypes.has(notification.type)
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesPriority && matchesType && matchesSearch
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleStatusChange = async (status: NotificationStatus) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handlePriorityToggle = (priority: NotificationPriority) => {
    setSelectedPriorities(prev => {
      const next = new Set(prev)
      if (next.has(priority)) {
        next.delete(priority)
      } else {
        next.add(priority)
      }
      return next
    })
    setCurrentPage(1)
  }

  const handleTypeToggle = (type: NotificationType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
    setCurrentPage(1)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleMarkAsRead = async (id: number) => {
    await updateNotificationStatus(id, "read")
  }

  const handleArchive = async (id: number) => {
    await updateNotificationStatus(id, "archived")
  }

  const FilterDropdown = ({ 
    label, 
    options, 
    selected, 
    onToggle 
  }: { 
    label: string
    options: { name: string; value: string }[]
    selected: Set<string>
    onToggle: (value: any) => void
  }) => (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="group inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
        {label}
        {selected.size > 0 && (
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            {selected.size}
          </span>
        )}
        <ChevronDown
          className="ml-2 h-5 w-5 flex-none text-gray-400 group-hover:text-gray-500"
          aria-hidden="true"
        />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.value}>
                {({ active }) => (
                  <div
                    className={clsx(
                      active ? "bg-gray-50" : "",
                      "flex items-center px-4 py-2 cursor-pointer"
                    )}
                    onClick={() => onToggle(option.value)}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(option.value)}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {option.name}
                    </span>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        {allNotifications.length > 0 && selectedStatus === "unread" && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search notifications..."
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <nav className="flex space-x-4" aria-label="Tabs">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusChange(filter.value)}
                    className={clsx(
                      selectedStatus === filter.value
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {filter.name}
                  </button>
                ))}
              </nav>
            </div>

            <FilterDropdown
              label="Priority"
              options={priorityFilters}
              selected={selectedPriorities}
              onToggle={handlePriorityToggle}
            />
            <FilterDropdown
              label="Type"
              options={typeFilters}
              selected={selectedTypes}
              onToggle={handleTypeToggle}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {Math.min(filteredNotifications.length, startIndex + 1)}-
        {Math.min(filteredNotifications.length, startIndex + ITEMS_PER_PAGE)} of{" "}
        {filteredNotifications.length} notifications
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400 animate-bounce" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Loading notifications...
          </h3>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Error loading notifications
          </h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No notifications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search or filters"
              : selectedStatus === "unread"
              ? "You're all caught up!"
              : `No ${selectedStatus} notifications`}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white/70 backdrop-blur-sm shadow overflow-hidden sm:rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {paginatedNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={clsx(
                    "p-4 hover:bg-gray-50/50 transition-colors duration-150",
                    notification.status === "unread" && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className={clsx(
                            "text-sm font-medium truncate",
                            priorityColors[notification.priority as keyof typeof priorityColors]
                          )}
                        >
                          {notification.title}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          View details
                        </a>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                      {notification.status === "unread" && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      {notification.status !== "archived" && (
                        <button
                          onClick={() => handleArchive(notification.id)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Clock className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={clsx(
                          page === currentPage
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50",
                          "relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}