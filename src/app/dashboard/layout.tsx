"use client"

import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-gray-50 to-purple-100 relative">
      <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[1px]"></div>
      <div className="relative flex min-h-full">
        {/* Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="lg:pl-72 flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}