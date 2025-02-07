import { Bell } from "lucide-react"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="mb-6">
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-20 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </nav>
        </div>
      </div>

      <div className="text-center py-12">
        <Bell className="mx-auto h-12 w-12 text-gray-400 animate-bounce" />
        <div className="mt-2 h-5 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="mt-1 h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="ml-2 h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="mt-1 h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}