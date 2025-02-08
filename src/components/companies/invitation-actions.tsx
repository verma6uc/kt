import { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { invitation_status } from '@prisma/client'

interface InvitationActionsProps {
  invitation: {
    id: number
    email: string
    status: invitation_status
    created_at: Date
    expires_at: Date
    accepted_at?: Date | null
    cancelled_at?: Date | null
    reminder_sent_at?: Date | null
    reminder_count?: number
  }
}

export default function InvitationActions({ invitation }: InvitationActionsProps) {
  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }
    return new Date(date).toLocaleString(undefined, options)
  }

  const getStatusBadge = () => {
    switch (invitation.status) {
      case 'pending':
        const isNearExpiry = new Date(invitation.expires_at).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000 // 48 hours
        return (
          <div className="inline-flex items-center">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isNearExpiry ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isNearExpiry ? (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Near Expiry
                </>
              ) : (
                'Pending'
              )}
            </span>
          </div>
        )
      case 'accepted':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Accepted
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expired
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const getInvitationDetails = () => {
    const details = []

    if (invitation.accepted_at) {
      details.push(`Accepted ${formatDateTime(invitation.accepted_at)}`)
    }

    if (invitation.cancelled_at) {
      details.push(`Cancelled ${formatDateTime(invitation.cancelled_at)}`)
    }

    if (invitation.reminder_sent_at && invitation.reminder_count) {
      details.push(`Last reminder ${formatDateTime(invitation.reminder_sent_at)}`)
    }

    if (invitation.status === 'pending') {
      details.push(`Expires ${formatDateTime(invitation.expires_at)}`)
    }

    if (details.length === 0) return null

    return (
      <div className="mt-0.5 text-xs text-gray-500 space-y-0.5">
        {details.map((detail, index) => (
          <div key={index}>{detail}</div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {getStatusBadge()}
      {getInvitationDetails()}
    </div>
  )
}