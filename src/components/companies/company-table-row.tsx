"use client"

import { Company } from '@/types/company'
import { CompanyTableActions } from './company-table-actions'
import Link from 'next/link'

interface CompanyTableRowProps {
  company: Company
  onStatusChange: () => void
  onEdit: (company: Company) => void
}

export function CompanyTableRow({ company, onStatusChange, onEdit }: CompanyTableRowProps) {
  return (
    <tr key={company.id}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex items-center">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {company.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-4">
            <Link 
              href={`/dashboard/companies/${company.id}`}
              className="font-medium text-gray-900 hover:text-indigo-600"
            >
              {company.name}
            </Link>
            <div className="text-gray-500">{company.identifier}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.industry ? formatText(company.industry) : 'N/A'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {formatText(company.type)}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company._count?.user || 0} users
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          company.status === 'active'
            ? 'bg-green-100 text-green-800'
            : company.status === 'pending_setup'
            ? 'bg-yellow-100 text-yellow-800'
            : company.status === 'suspended'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {formatText(company.status)}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <CompanyTableActions 
          company={company} 
          onEdit={() => onEdit(company)}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  )
}

const formatText = (text: string) => {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}