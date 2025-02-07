"use client"

import { Mail, Users } from 'lucide-react'
import { Company } from '@/types/company'
import { CompanyActionMenu } from './company-action-menu'
import clsx from 'clsx'

interface CompanyTableRowProps {
  company: Company
  actionMenuOpen: boolean
  onActionMenuToggle: () => void
  onAction: (action: 'edit' | 'suspend' | 'archive') => void
  onMenuClick: (e: React.MouseEvent) => void
}

export function CompanyTableRow({
  company,
  actionMenuOpen,
  onActionMenuToggle,
  onAction,
  onMenuClick
}: CompanyTableRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="font-medium">{company.name}</div>
        <div className="text-sm text-gray-500">{company.identifier}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {company.type.split('_').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span
          className={clsx(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            {
              'bg-green-100 text-green-800': company.status === 'active',
              'bg-yellow-100 text-yellow-800': company.status === 'pending_setup',
              'bg-red-100 text-red-800': company.status === 'suspended',
              'bg-gray-100 text-gray-800': company.status === 'inactive',
              'bg-purple-100 text-purple-800': company.status === 'archived',
            }
          )}
        >
          {company.status.split('_').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {company.industry ? (
          company.industry.charAt(0).toUpperCase() + company.industry.slice(1)
        ) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-blue-500" />
          <span>{company._count.users}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {company.users[0]?.email ? (
          <div>
            {company.users[0].name && (
              <div className="font-medium text-gray-900">{company.users[0].name}</div>
            )}
            <div className="flex items-center text-blue-600">
              <Mail className="h-4 w-4 mr-1" />
              {company.users[0].email}
            </div>
          </div>
        ) : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <CompanyActionMenu
          company={company}
          isOpen={actionMenuOpen}
          onToggle={onActionMenuToggle}
          onAction={onAction}
          onMenuClick={onMenuClick}
        />
      </td>
    </tr>
  )
}