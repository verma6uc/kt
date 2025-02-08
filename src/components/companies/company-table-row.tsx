"use client"

import { Company } from "@/types/company"
import { CompanyTableActions } from "./company-table-actions"
import { Users } from "lucide-react"
import Image from "next/image"

interface CompanyTableRowProps {
  company: Company
  onEdit: (company: Company) => void
  onStatusChange: () => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-50 text-green-700 ring-green-600/20'
    case 'inactive':
      return 'bg-gray-50 text-gray-600 ring-gray-500/10'
    case 'suspended':
      return 'bg-red-50 text-red-700 ring-red-600/10'
    case 'pending_setup':
      return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-500/10'
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function CompanyTableRow({ company, onEdit, onStatusChange }: CompanyTableRowProps) {
  const statusColor = getStatusColor(company.status)
  const createdDate = new Date(company.created_at)
  const formattedDate = formatDate(createdDate)

  return (
    <tr key={company.id}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            {company.logo_url ? (
              <Image
                className="h-10 w-10 rounded-full object-cover"
                src={company.logo_url}
                alt={company.name}
                width={40}
                height={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{company.name}</div>
            <div className="text-gray-500">{company.identifier}</div>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.industry || '-'}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {company.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-400" />
          {company._count?.user || 0}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColor}`}
        >
          {company.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {formattedDate}
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <CompanyTableActions
          company={company}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  )
}