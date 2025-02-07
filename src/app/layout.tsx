import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/components/session-provider'
import { authOptions } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yuvi',
  description: 'Company Management Platform',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-yuvi-gray-50 text-yuvi-gray-500 antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
