import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { companyColumns } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch all companies
    const companies = await prisma.company.findMany({
      orderBy: {
        created_at: 'desc'
      },
      select: {
        name: true,
        identifier: true,
        industry: true,
        type: true,
        status: true,
        created_at: true
      }
    })

    // Format data for CSV
    const formattedCompanies = companies.map(company => ({
      ...company,
      type: company.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      status: company.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      created_at: new Date(company.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }))

    // Create CSV content
    const rows = [
      // Header row
      companyColumns.map(col => col.header).join(','),
      // Data rows
      ...formattedCompanies.map(company => 
        companyColumns.map(col => `"${company[col.key as keyof typeof company]}"`).join(',')
      )
    ]

    const csvContent = rows.join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="companies-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting companies:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}