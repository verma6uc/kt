import { useState } from 'react'
import { MoreVertical, RefreshCw, X, Clock } from 'lucide-react'
import { invitation_status } from '@prisma/client'
import { toast } from 'react-hot-toast'
import InvitationConfirmationModal from './invitation-confirmation-modal'

interface InvitationDropdownProps {
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
  companyId: number
  onSuccess?: () => void
}

export default function InvitationDropdown({ invitation, companyId, onSuccess }: InvitationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    action: 'resend' | 'cancel'
  }>({
    isOpen: false,
    action: 'resend'
  })

  const handleAction = async (action: 'resend' | 'cancel') => {
    try {
      setIsProcessing(true)
      const response = await fetch(`/api/companies/${companyId}/admin-invitation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitationId: invitation.id,
          action
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      toast.success(action === 'resend' ? 'Invitation resent successfully' : 'Invitation cancelled successfully')
      onSuccess?.()
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error)
      toast.error(error instanceof Error ? error.message : `Failed to ${action} invitation`)
    } finally {
      setIsProcessing(false)
      setConfirmationModal({ isOpen: false, action: 'resend' })
      setIsOpen(false)
    }
  }

  const getActions = () => {
    switch (invitation.status) {
      case 'pending':
        return [
          {
            label: 'Resend Invitation',
            icon: RefreshCw,
            onClick: () => setConfirmationModal({ isOpen: true, action: 'resend' }),
            className: 'text-blue-600 hover:text-blue-900'
          },
          {
            label: 'Cancel Invitation',
            icon: X,
            onClick: () => setConfirmationModal({ isOpen: true, action: 'cancel' }),
            className: 'text-red-600 hover:text-red-900'
          }
        ]
      case 'expired':
      case 'cancelled':
        return [
          {
            label: 'Resend Invitation',
            icon: RefreshCw,
            onClick: () => setConfirmationModal({ isOpen: true, action: 'resend' }),
            className: 'text-blue-600 hover:text-blue-900'
          }
        ]
      default:
        return []
    }
  }

  const actions = getActions()
  if (actions.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isProcessing}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={isProcessing}
                    className={`${action.className} flex w-full items-center px-4 py-2 text-sm disabled:opacity-50`}
                    role="menuitem"
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      <InvitationConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, action: 'resend' })}
        onConfirm={() => handleAction(confirmationModal.action)}
        action={confirmationModal.action}
        email={invitation.email}
        isProcessing={isProcessing}
      />
    </div>
  )
}