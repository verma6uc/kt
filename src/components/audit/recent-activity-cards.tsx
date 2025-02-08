"use client"

import { formatDistanceToNow } from "date-fns"
import { 
  LogIn, 
  Settings, 
  Building, 
  UserPlus, 
  Shield, 
  AlertTriangle,
  Mail,
  Key
} from "lucide-react"
import { AuditLog } from "@/types/audit"

interface Props {
  auditLogs: AuditLog[]
}

const getActionConfig = (action: string) => {
  switch (action) {
    case 'login':
      return {
        icon: <LogIn className="h-4 w-4 text-blue-600" />,
        severity: 'low',
        bgColor: 'bg-blue-50 border-blue-200'
      }
    case 'login_failed':
      return {
        icon: <LogIn className="h-4 w-4 text-red-600" />,
        severity: 'high',
        bgColor: 'bg-red-50 border-red-200'
      }
    case 'settings_update':
      return {
        icon: <Settings className="h-4 w-4 text-amber-600" />,
        severity: 'medium',
        bgColor: 'bg-amber-50 border-amber-200'
      }
    case 'company_create':
      return {
        icon: <Building className="h-4 w-4 text-green-600" />,
        severity: 'low',
        bgColor: 'bg-green-50 border-green-200'
      }
    case 'company_update':
      return {
        icon: <Building className="h-4 w-4 text-blue-600" />,
        severity: 'low',
        bgColor: 'bg-blue-50 border-blue-200'
      }
    case 'user_invite':
      return {
        icon: <UserPlus className="h-4 w-4 text-purple-600" />,
        severity: 'medium',
        bgColor: 'bg-purple-50 border-purple-200'
      }
    case 'security_update':
      return {
        icon: <Shield className="h-4 w-4 text-red-600" />,
        severity: 'high',
        bgColor: 'bg-red-50 border-red-200'
      }
    case 'email_sent':
      return {
        icon: <Mail className="h-4 w-4 text-cyan-600" />,
        severity: 'low',
        bgColor: 'bg-cyan-50 border-cyan-200'
      }
    case 'password_change':
      return {
        icon: <Key className="h-4 w-4 text-orange-600" />,
        severity: 'medium',
        bgColor: 'bg-orange-50 border-orange-200'
      }
    default:
      return {
        icon: <AlertTriangle className="h-4 w-4 text-gray-600" />,
        severity: 'low',
        bgColor: 'bg-gray-50 border-gray-200'
      }
  }
}

export function RecentActivityCards({ auditLogs }: Props) {
  if (!auditLogs.length) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">No recent activity to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {auditLogs.map((log) => {
        const config = getActionConfig(log.action)
        return (
          <div
            key={log.uuid}
            className={`w-full border rounded-lg px-4 py-3 ${config.bgColor} hover:shadow-sm transition-shadow duration-200`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ')}
                    </p>
                    <span className="text-xs text-gray-500">•</span>
                    <p className="text-sm text-gray-600 truncate">
                      {log.details}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <span className="font-medium text-gray-900">
                    {log.user.name || log.user.email}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{log.company.name}</span>
                  {log.ip_address && (
                    <>
                      <span className="mx-1">•</span>
                      <span>IP: {log.ip_address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}