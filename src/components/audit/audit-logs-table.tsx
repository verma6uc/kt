"use client"

import { formatDistanceToNow } from 'date-fns'
import { Activity, User, Building2 } from 'lucide-react'
import Link from 'next/link'

interface AuditMetadata {
  id: number
  audit_log_id: number
  key: string
  value: string
}

interface AuditLog {
  id: number
  action: string
  details: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user: {
    id: number
    name: string | null
    email: string
    role: string
  }
  company: {
    id: number
    name: string
    identifier: string
  }
  metadata: AuditMetadata[]
}

interface AuditLogsTableProps {
  auditLogs: AuditLog[]
}

export function AuditLogsTable({ auditLogs }: AuditLogsTableProps) {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600 bg-green-100'
      case 'update':
        return 'text-blue-600 bg-blue-100'
      case 'delete':
        return 'text-red-600 bg-red-100'
      case 'login':
        return 'text-purple-600 bg-purple-100'
      case 'login_failed':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="mt-6 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Action & Details
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    User
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Company
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <Activity className={`h-5 w-5 flex-shrink-0 ${getActionColor(log.action)}`} />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1).replace('_', ' ')}
                          </div>
                          <div className="text-gray-500 whitespace-pre-wrap">{log.details}</div>
                          {log.metadata.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {log.metadata.map((meta) => (
                                <div key={meta.id}>
                                  <span className="font-medium">{meta.key}:</span> {meta.value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{log.user.name || log.user.email}</div>
                          <div className="text-xs">{log.user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">
                            <Link href={`/dashboard/companies?company=${log.company.id}`} className="hover:text-blue-600">
                              {log.company.name}
                            </Link>
                          </div>
                          <div className="text-xs">{log.company.identifier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}