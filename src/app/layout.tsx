import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { SessionProvider } from '@/components/session-provider'
import { ApiProvider } from '@/components/providers/api-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Yuvi - Company Management Platform',
  description: 'Manage your companies and monitor their performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ApiProvider>
            {children}
            <Toaster position="top-right" />
          </ApiProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
