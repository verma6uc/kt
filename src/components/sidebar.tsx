"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, ClipboardList, Bell } from "lucide-react"
import { Logo } from "./logo"
import clsx from "clsx"
import { useSession } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Companies", href: "/dashboard/companies", icon: Building2 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { 
    name: "Audit Logs", 
    href: "/dashboard/audit", 
    icon: ClipboardList,
    adminOnly: true 
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || (item.adminOnly && isSuperAdmin)
  )

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={clsx(
                        isActive
                          ? "bg-gray-50 text-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium"
                      )}
                    >
                      <item.icon
                        className={clsx(
                          "text-blue-600",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}