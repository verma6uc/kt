"use client"

import { Company } from '@/types/company'
import { CompanyTableActions } from './company-table-actions'
import Link from 'next/link'

interface CompanyTableRowProps {
  company: Company
  onEdit: (company: Company) => void
}

export function CompanyTableRow({ company, onEdit }: CompanyTableRowProps) {
  return (
    <tr key={company.id}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex items-center">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 font-medium">
                {company.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="ml-4">
            <Link 
              href={`/dashboard/companies/${company.id}`}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {company.name}
            </Link>
            <div className="text-gray-500">{company.identifier}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.industry || 'N/A'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.type}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.employee_count || 'N/A'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
          company.status === 'active'
            ? 'bg-green-100 text-green-800'
            : company.status === 'pending_setup'
            ? 'bg-yellow-100 text-yellow-800'
            : company.status === 'suspended'
            ? 'bg-red-100 text-red-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {company.status.replace('_', ' ')}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <CompanyTableActions company={company} onEdit={onEdit} />
      </td>
    </tr>
  )
}