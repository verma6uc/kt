import { RefreshCw, X } from 'lucide-react'

interface InvitationConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  action: 'resend' | 'cancel'
  email: string
  isProcessing: boolean
}

export default function InvitationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  email,
  isProcessing
}: InvitationConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {action === 'resend' ? 'Resend Invitation' : 'Cancel Invitation'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            {action === 'resend' ? (
              <>
                Are you sure you want to resend the invitation to <strong>{email}</strong>?
                <br />
                <br />
                This will:
                <ul className="ml-4 list-disc">
                  <li>Generate a new invitation link</li>
                  <li>Invalidate any previous invitation links</li>
                  <li>Reset the expiration period</li>
                  <li>Send a new invitation email</li>
                </ul>
              </>
            ) : (
              <>
                Are you sure you want to cancel the invitation for <strong>{email}</strong>?
                <br />
                <br />
                This will:
                <ul className="ml-4 list-disc">
                  <li>Invalidate the invitation link immediately</li>
                  <li>Prevent the user from accepting the invitation</li>
                  <li>Record the cancellation in the audit log</li>
                </ul>
              </>
            )}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${
              action === 'resend'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {action === 'resend' ? 'Resending...' : 'Cancelling...'}
              </>
            ) : (
              <>
                {action === 'resend' ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                {action === 'resend' ? 'Resend Invitation' : 'Cancel Invitation'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}