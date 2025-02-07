"use client"

import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  onClose: (id: string) => void
  duration?: number
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200'
}

const iconStyles = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
}

export function Toast({
  id,
  type,
  title,
  message,
  onClose,
  duration = 5000
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const Icon = icons[type]

  return (
    <div
      className={`flex w-full max-w-sm overflow-hidden rounded-lg shadow-lg border ${styles[type]} transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex items-start gap-4 p-4 w-full">
        <Icon className={`h-5 w-5 ${iconStyles[type]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}